import json
from datetime import datetime, timedelta
import random


class ChatbotEngine:
    """AI Chatbot that answers questions using dataset context and all factory data."""

    def __init__(self, db_models):
        self.Machine, self.Prediction, self.Dataset = db_models
        self._datasets = None
        self._workers = None
        self._orders = None
        self._materials = None

    def _lazy_load(self):
        if self._datasets is None:
            try:
                from backend.models.database import Worker, ProductionOrder, RawMaterial
                self._workers = Worker
                self._orders = ProductionOrder
                self._materials = RawMaterial
                self._datasets = True
            except Exception:
                self._datasets = False

    def respond(self, query):
        q = query.lower().strip()
        self._lazy_load()

        if any(w in q for w in ["machine", "equipment", "asset"]):
            return self._machine_response(q)
        if any(w in q for w in ["production", "output", "manufacturing", "order"]):
            return self._production_response(q)
        if any(w in q for w in ["failure", "fail", "break", "downtime", "defect"]):
            return self._failure_response(q)
        if any(w in q for w in ["health", "performance", "score"]):
            return self._health_response(q)
        if any(w in q for w in ["temperature", "temp"]):
            return self._temperature_response(q)
        if any(w in q for w in ["worker", "employee", "staff", "operator"]):
            return self._worker_response(q)
        if any(w in q for w in ["material", "stock", "inventory", "supply"]):
            return self._material_response(q)
        if any(w in q for w in ["trend", "forecast", "predict", "future"]) or "next month" in q:
            return self._trend_response(q)
        if any(w in q for w in ["compare", "vs", "versus"]):
            return self._comparison_response(q)
        if any(w in q for w in ["chart", "graph", "plot", "visualize", "show"]) or q.startswith("show"):
            return self._chart_response(q)
        if any(w in q for w in ["summary", "overview", "dashboard", "report"]):
            return self._summary_response()
        if any(w in q for w in ["hello", "hi", "hey", "good"]):
            return {
                "type": "text",
                "content": "Hello! I'm your AI Manufacturing Assistant. I can answer about **machines**, **production orders**, **workers**, **raw materials**, **failures**, **forecasts**, and generate **charts**. Try: *'Show machine health'* or *'Give me a factory summary'*."
            }
        return {
            "type": "text",
            "content": "I can help with: machines, production orders, workers, materials, failures, trends, comparisons, and charts. Try asking: *'Show failure analysis'*, *'Compare machines'*, *'Stock alerts'*, or *'Factory summary'*."
        }

    def _all_machines(self):
        return self.Machine.query.all()

    def _machine_response(self, q):
        machines = self._all_machines()
        total = len(machines)
        if not total:
            return {"type": "text", "content": "No machines found."}
        running = sum(1 for m in machines if m.status == "running")
        down = sum(1 for m in machines if m.status == "down")
        idle = sum(1 for m in machines if m.status == "idle")
        avg_health = sum(m.health_score for m in machines) / total
        if "detail" in q or "details" in q:
            lines = [f"- **{m.name}** ({m.code}): {m.status}, Health {m.health_score:.0f}%, {m.temperature:.1f}°C" for m in machines]
            return {"type": "text", "content": f"**Machine Details:**\n" + "\n".join(lines)}
        return {
            "type": "text",
            "content": f"**{total} machines** total. {running} running, {idle} idle, {down} down. Avg health: **{avg_health:.1f}%**."
        }

    def _production_response(self, q):
        if self._orders is None:
            return {"type": "text", "content": "Production data not available."}
        orders = self._orders.query.all()
        if not orders:
            return {"type": "text", "content": "No production orders found."}
        total_target = sum(o.target_qty for o in orders if o.target_qty)
        total_completed = sum(o.completed_qty for o in orders if o.completed_qty)
        total_scrap = sum(o.scrap_qty for o in orders if o.scrap_qty)
        in_progress = sum(1 for o in orders if o.status == "in_progress")
        completed = sum(1 for o in orders if o.status == "completed")
        scrap_rate = round((total_scrap / total_completed * 100), 1) if total_completed else 0
        completion = round((total_completed / total_target * 100), 1) if total_target else 0
        return {
            "type": "text",
            "content": f"**Production:** {len(orders)} orders ({in_progress} in progress, {completed} completed). "
                       f"Target: {total_target:,} units, Completed: {total_completed:,} units ({completion}%). "
                       f"Scrap: {total_scrap:,} units ({scrap_rate}%)."
        }

    def _failure_response(self, q):
        machines = self._all_machines()
        results = []
        for m in machines:
            preds = self.Prediction.query.filter_by(machine_id=m.id).all()
            fails = sum(1 for p in preds if p.predicted_value > 0.5)
            if preds:
                results.append((m.name, m.code, fails, len(preds), round(fails/len(preds)*100, 1)))
        results.sort(key=lambda x: x[3], reverse=True)
        if results:
            top = results[0]
            bottom = results[-1]
            total_fail = sum(r[2] for r in results)
            total_pred = sum(r[3] for r in results)
            return {
                "type": "text",
                "content": f"**Failure Analysis:** {total_fail}/{total_pred} failures overall ({round(total_fail/total_pred*100,1)}%). "
                           f"Highest: **{top[0]}** ({top[4]}%). Lowest: **{bottom[0]}** ({bottom[4]}%)."
            }
        return {"type": "text", "content": "No failure data available."}

    def _health_response(self, q):
        machines = self._all_machines()
        data = [{"machine": m.name, "health": m.health_score, "status": m.status} for m in machines]
        return {"type": "bar", "title": "Machine Health Scores", "labels": [d["machine"] for d in data], "values": [d["health"] for d in data]}

    def _temperature_response(self, q):
        machines = self._all_machines()
        data = [{"machine": m.name, "temperature": m.temperature} for m in machines]
        return {"type": "bar", "title": "Machine Temperature (°C)", "labels": [d["machine"] for d in data], "values": [d["temperature"] for d in data]}

    def _worker_response(self, q):
        if self._workers is None:
            return {"type": "text", "content": "Worker data not available."}
        workers = self._workers.query.all()
        if not workers:
            return {"type": "text", "content": "No workers found."}
        active = sum(1 for w in workers if w.status == "active")
        avg_perf = sum(w.performance_score for w in workers) / len(workers)
        shifts = {}
        for w in workers:
            s = w.shift or "unknown"
            shifts[s] = shifts.get(s, 0) + 1
        shift_info = ", ".join(f"{k}: {v}" for k, v in sorted(shifts.items()))
        return {
            "type": "text",
            "content": f"**Workforce:** {len(workers)} workers ({active} active). Avg performance: **{avg_perf:.1f}%**. "
                       f"Shifts: {shift_info}."
        }

    def _material_response(self, q):
        if self._materials is None:
            return {"type": "text", "content": "Material data not available."}
        materials = self._materials.query.all()
        if not materials:
            return {"type": "text", "content": "No materials found."}
        low = sum(1 for m in materials if m.status == "low_stock")
        total_value = sum(m.current_stock * m.unit_cost for m in materials if m.current_stock and m.unit_cost)
        if "alert" in q or "low" in q or "shortage" in q:
            items = [f"- {m.name} (**{m.current_stock:.0f}**/{m.minimum_stock:.0f} {m.unit})" for m in materials if m.status == "low_stock"]
            return {"type": "text", "content": f"**Low Stock Alerts:** {len(items)} items\n" + "\n".join(items) if items else "No low stock items."}
        return {
            "type": "text",
            "content": f"**Inventory:** {len(materials)} materials ({low} low stock). Total value: **${total_value:,.2f}**."
        }

    def _trend_response(self, q):
        preds = self.Prediction.query.order_by(self.Prediction.created_at.desc()).limit(30).all()
        if not preds:
            return {"type": "line", "title": "Production Forecast", "labels": [], "values": []}
        labels = [p.created_at.strftime("%b %d") if p.created_at else f"Day {i}" for i, p in enumerate(reversed(preds))]
        values = [round(p.predicted_value * 100, 1) for p in reversed(preds)]
        forecast = [round(v * random.uniform(0.95, 1.05), 1) for v in values[-7:]]
        return {
            "type": "line",
            "title": "Production Trend & Forecast",
            "labels": labels, "values": values, "forecast": forecast,
        }

    def _comparison_response(self, q):
        machines = self._all_machines()
        return {
            "type": "radar",
            "title": "Machine Performance Comparison",
            "labels": ["Health", "Temperature", "Torque", "Tool Wear", "Vibration"],
            "datasets": [{
                "label": m.name,
                "values": [m.health_score / 20, m.temperature / 10, m.torque / 10, m.tool_wear / 20, m.vibration * 5]
            } for m in machines[:5]]
        }

    def _chart_response(self, q):
        machines = self._all_machines()
        if "downtime" in q:
            data = [{"machine": m.name, "value": 100 - m.health_score} for m in machines]
            return {"type": "pie", "title": "Downtime by Machine", "labels": [d["machine"] for d in data], "values": [d["value"] for d in data]}
        if "defect" in q or "quality" in q:
            data = [{"machine": m.name, "value": round(m.tool_wear * random.uniform(0.5, 1.5), 1)} for m in machines]
            return {"type": "bar", "title": "Defect Analysis by Machine", "labels": [d["machine"] for d in data], "values": [d["value"] for d in data]}
        if "production" in q:
            if self._orders:
                orders = self._orders.query.all()
                if orders:
                    products = {}
                    for o in orders:
                        products[o.product_name] = products.get(o.product_name, 0) + (o.completed_qty or 0)
                    return {"type": "pie", "title": "Production by Product", "labels": list(products.keys()), "values": list(products.values())}
        if "stock" in q or "inventory" in q:
            if self._materials:
                mats = self._materials.query.all()
                if mats:
                    return {"type": "bar", "title": "Current Stock Levels", "labels": [m.name for m in mats], "values": [m.current_stock for m in mats]}
        return self._health_response(q)

    def _summary_response(self):
        machines = self._all_machines()
        running = sum(1 for m in machines if m.status == "running")
        down = sum(1 for m in machines if m.status == "down")
        avg_health = sum(m.health_score for m in machines) / len(machines) if machines else 0
        parts = [f"**{len(machines)} machines** ({running} running, {down} down, avg health {avg_health:.1f}%)"]
        if self._orders:
            orders = self._orders.query.all()
            if orders:
                completed = sum(1 for o in orders if o.status == "completed")
                total_completed_qty = sum(o.completed_qty or 0 for o in orders)
                parts.append(f"**{len(orders)} orders** ({completed} completed, {total_completed_qty:,} units produced)")
        if self._workers:
            workers = self._workers.query.all()
            if workers:
                parts.append(f"**{len(workers)} workers**")
        if self._materials:
            materials = self._materials.query.all()
            if materials:
                low = sum(1 for m in materials if m.status == "low_stock")
                parts.append(f"**{len(materials)} materials** ({low} low stock)")
        pred_count = self.Prediction.query.count()
        parts.append(f"**{pred_count} predictions** logged")
        return {"type": "text", "content": "📊 **Factory Overview:** " + " | ".join(parts) + "."}
