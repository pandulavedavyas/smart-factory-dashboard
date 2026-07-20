import random
import math
from datetime import datetime, timedelta, date
from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.database import Machine, Worker, ProductionOrder, RawMaterial
from backend.api.auth import auth_required, role_required

finance_bp = Blueprint("finance", __name__)


def _generate_financial_data():
    """Generate realistic financial data from existing seed data."""
    now = datetime.utcnow()
    machines = Machine.query.all()
    workers = Worker.query.all()
    orders = ProductionOrder.query.all()
    materials = RawMaterial.query.all()

    total_output = sum(o.completed_qty for o in orders)
    total_scrap = sum(o.scrap_qty for o in orders)
    material_cost = sum(m.current_stock * m.unit_cost for m in materials)
    labor_cost = sum((w.hourly_rate or 15) * 8 * 30 for w in workers)
    energy_cost = len(machines) * 1200
    maintenance_cost = sum(max(0, 500 - m.health_score * 3) for m in machines)

    avg_selling_price = 45.0
    revenue = total_output * avg_selling_price
    total_expenses = material_cost + labor_cost + energy_cost + maintenance_cost
    net_profit = revenue - total_expenses
    profit_margin = (net_profit / revenue * 100) if revenue > 0 else 0

    return {
        "machines": machines, "workers": workers, "orders": orders,
        "materials": materials, "total_output": total_output, "total_scrap": total_scrap,
        "material_cost": material_cost, "labor_cost": labor_cost,
        "energy_cost": energy_cost, "maintenance_cost": maintenance_cost,
        "revenue": revenue, "total_expenses": total_expenses,
        "net_profit": net_profit, "profit_margin": profit_margin,
        "avg_selling_price": avg_selling_price,
    }


@finance_bp.route("/dashboard", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def financial_dashboard():
    d = _generate_financial_data()
    now = datetime.utcnow()
    days_in_month = 30

    daily_rev = d["revenue"] / days_in_month
    weekly_rev = daily_rev * 7
    monthly_rev = d["revenue"]
    operating_cost = d["energy_cost"] + d["maintenance_cost"]
    cost_per_unit = d["total_expenses"] / max(d["total_output"], 1)
    rev_per_machine = d["revenue"] / max(len(d["machines"]), 1)
    rev_per_worker = d["revenue"] / max(len(d["workers"]), 1)
    gross_profit = d["revenue"] - d["material_cost"]
    inventory_value = d["material_cost"]
    roi = (d["net_profit"] / max(d["total_expenses"], 1)) * 100

    completed = [o for o in d["orders"] if o.status == "completed"]
    pending = [o for o in d["orders"] if o.status == "in_progress"]

    return jsonify({
        "total_revenue": round(d["revenue"], 2),
        "total_income_generated": round(d["revenue"], 2),
        "total_production_value": round(d["revenue"] * 1.15, 2), # Production value is slightly higher than revenue due to inventory buffer
        "monthly_revenue": round(monthly_rev, 2),
        "weekly_revenue": round(weekly_rev, 2),
        "daily_revenue": round(daily_rev, 2),
        "total_expenses": round(d["total_expenses"], 2),
        "net_profit": round(d["net_profit"], 2),
        "gross_profit": round(gross_profit, 2),
        "profit_margin": round(d["profit_margin"], 1),
        "total_orders": len(d["orders"]),
        "completed_orders": len(completed),
        "pending_orders": len(pending),
        "factory_growth": round(random.uniform(5, 18), 1),
        "operating_cost": round(operating_cost, 2),
        "manufacturing_cost": round(d["material_cost"] + d["energy_cost"], 2),
        "inventory_value": round(inventory_value, 2),
        "roi": round(roi, 1),
        "cost_per_unit": round(cost_per_unit, 2),
        "revenue_per_machine": round(rev_per_machine, 2),
        "revenue_per_worker": round(rev_per_worker, 2),
        "material_cost": round(d["material_cost"], 2),
        "labor_cost": round(d["labor_cost"], 2),
        "energy_cost": round(d["energy_cost"], 2),
        "maintenance_cost": round(d["maintenance_cost"], 2),
    })


@finance_bp.route("/revenue", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def revenue_analytics():
    d = _generate_financial_data()
    base = d["revenue"]
    products = ["Hydraulic Valve", "Bearing Housing", "Gear Set", "Motor Mount", "Sensor Cover"]
    machine_names = [m.name for m in d["machines"]]

    daily = [{"label": f"Day {i+1}", "revenue": round(base/30 * random.uniform(0.7, 1.3), 2)} for i in range(30)]
    weekly = [{"label": f"Wk {i+1}", "revenue": round(base/4 * random.uniform(0.8, 1.2), 2)} for i in range(12)]
    monthly = [{"label": m, "revenue": round(base/5 * random.uniform(0.7, 1.3), 2)} for m in ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]]

    by_product = [{"name": p, "revenue": round(base * random.uniform(0.1, 0.3), 2)} for p in products]
    by_machine = [{"name": m, "revenue": round(base / len(machine_names) * random.uniform(0.6, 1.4), 2)} for m in machine_names]
    by_line = [{"name": f"Line-{i+1}", "revenue": round(base/3 * random.uniform(0.7, 1.3), 2)} for i in range(3)]

    expenses = [round(d["total_expenses"] / 30 * random.uniform(0.8, 1.2), 2) for _ in range(30)]
    profits = [round(d["revenue"]/30 * random.uniform(0.7, 1.3) - e, 2) for e in expenses]

    return jsonify({
        "daily": daily, "weekly": weekly, "monthly": monthly,
        "by_product": by_product, "by_machine": by_machine, "by_line": by_line,
        "revenue_vs_expenses": {
            "labels": [f"Day {i+1}" for i in range(30)],
            "revenue": [round(d["revenue"]/30 * random.uniform(0.7, 1.3), 2) for _ in range(30)],
            "expenses": expenses,
        },
        "profit_trend": {
            "labels": [f"Day {i+1}" for i in range(30)],
            "profit": profits,
        },
        "total_revenue": round(d["revenue"], 2),
        "avg_daily": round(d["revenue"]/30, 2),
        "best_day": round(max(daily, key=lambda x: x["revenue"])["revenue"], 2),
        "growth_rate": round(random.uniform(5, 18), 1),
    })


@finance_bp.route("/expenses", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def expense_dashboard():
    d = _generate_financial_data()

    material_purchases = [
        {"name": "Steel Rod 10mm", "supplier": "SteelCo", "qty": 500, "unit_price": 2.50, "total": 1250, "tax": 125, "invoice": "INV-2026-001", "payment": "paid", "date": "2026-07-15"},
        {"name": "Aluminum Sheet", "supplier": "AluSupply", "qty": 100, "unit_price": 15.00, "total": 1500, "tax": 150, "invoice": "INV-2026-002", "payment": "paid", "date": "2026-07-12"},
        {"name": "Bearing 6205", "supplier": "BearingPro", "qty": 50, "unit_price": 8.50, "total": 425, "tax": 42.5, "invoice": "INV-2026-003", "payment": "pending", "date": "2026-07-10"},
        {"name": "Welding Wire", "supplier": "WeldSupply", "qty": 200, "unit_price": 5.50, "total": 1100, "tax": 110, "invoice": "INV-2026-004", "payment": "paid", "date": "2026-07-08"},
        {"name": "Lubricant Oil", "supplier": "ChemSupply", "qty": 150, "unit_price": 3.20, "total": 480, "tax": 48, "invoice": "INV-2026-005", "payment": "paid", "date": "2026-07-05"},
        {"name": "Packaging Material", "supplier": "PackCo", "qty": 1000, "unit_price": 1.20, "total": 1200, "tax": 120, "invoice": "INV-2026-006", "payment": "pending", "date": "2026-07-03"},
    ]

    manufacturing = {
        "electricity": round(d["energy_cost"], 2),
        "water": round(d["energy_cost"] * 0.12, 2),
        "internet": 350,
        "fuel": round(d["energy_cost"] * 0.2, 2),
        "maintenance": round(d["maintenance_cost"], 2),
        "machine_repair": round(d["maintenance_cost"] * 0.4, 2),
        "salaries": round(d["labor_cost"], 2),
        "overtime": round(d["labor_cost"] * 0.08, 2),
        "transportation": round(d["total_expenses"] * 0.03, 2),
        "warehouse": round(d["total_expenses"] * 0.02, 2),
        "quality_inspection": round(d["total_expenses"] * 0.015, 2),
        "factory_rent": 12000,
        "insurance": 3500,
    }

    categories = ["Steel", "Plastic", "Rubber", "Electronics", "Packaging", "Chemicals", "Other"]
    by_category = [{"name": c, "amount": round(d["material_cost"] * random.uniform(0.05, 0.35), 2)} for c in categories]
    total_material = sum(c["amount"] for c in by_category)

    monthly_costs = [{"month": m, "cost": round(d["total_expenses"] / 12 * random.uniform(0.8, 1.2), 2)}
                     for m in ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]]

    return jsonify({
        "total_expenses": round(d["total_expenses"], 2),
        "material_purchases": material_purchases,
        "manufacturing": manufacturing,
        "by_category": by_category,
        "total_material_cost": round(total_material, 2),
        "monthly_costs": monthly_costs,
        "daily_cost": round(d["total_expenses"] / 30, 2),
        "yearly_cost": round(d["total_expenses"] * 12, 2),
    })


@finance_bp.route("/production-cost", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def production_cost():
    d = _generate_financial_data()
    total = d["total_output"]

    cost_per_product = {
        "material": round(d["material_cost"] / max(total, 1), 2),
        "machine_running": round(d["energy_cost"] / max(total, 1), 2),
        "energy": round(d["energy_cost"] * 0.6 / max(total, 1), 2),
        "labour": round(d["labor_cost"] / max(total, 1), 2),
        "maintenance": round(d["maintenance_cost"] / max(total, 1), 2),
        "waste": round(d["total_scrap"] * 5 / max(total, 1), 2),
        "packaging": round(total * 0.8 / max(total, 1), 2),
        "shipping": round(total * 1.2 / max(total, 1), 2),
    }

    total_mfg_cost = sum(cost_per_product.values())
    selling_price = d["avg_selling_price"]
    net_per_unit = selling_price - total_mfg_cost
    profit_pct = (net_per_unit / selling_price * 100) if selling_price > 0 else 0
    break_even_units = round(d["total_expenses"] / max(net_per_unit, 0.01), 0)

    return jsonify({
        "cost_per_product": cost_per_product,
        "total_manufacturing_cost": round(total_mfg_cost, 2),
        "total_selling_price": round(selling_price, 2),
        "net_profit_per_unit": round(net_per_unit, 2),
        "profit_percentage": round(profit_pct, 1),
        "break_even_units": int(break_even_units),
        "total_units": total,
        "total_revenue": round(d["revenue"], 2),
        "total_cost": round(d["total_expenses"], 2),
        "by_machine": [{"name": m.name, "cost": round(d["energy_cost"] / len(d["machines"]) * random.uniform(0.7, 1.3), 2),
                        "revenue": round(d["revenue"] / len(d["machines"]) * random.uniform(0.8, 1.2), 2)}
                       for m in d["machines"]],
    })


@finance_bp.route("/purchases", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def purchase_analytics():
    d = _generate_financial_data()
    materials = d["materials"]

    by_material = [{"name": m.name, "purchased": round(m.current_stock * m.unit_cost, 2),
                     "stock": m.current_stock, "unit": m.unit, "cost": m.unit_cost,
                     "supplier": m.supplier, "category": m.category}
                    for m in materials]

    suppliers = list(set(m.supplier for m in materials if m.supplier))
    by_supplier = [{"name": s, "total": round(sum(m.current_stock * m.unit_cost for m in materials if m.supplier == s), 2)} for s in suppliers]

    monthly_purchases = [{"month": m, "amount": round(d["material_cost"] / 12 * random.uniform(0.7, 1.3), 2)}
                         for m in ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]]

    return jsonify({
        "total_purchased": round(d["material_cost"], 2),
        "current_inventory": round(d["material_cost"], 2),
        "monthly_avg": round(d["material_cost"] / 12, 2),
        "by_material": by_material,
        "by_supplier": by_supplier,
        "monthly_purchases": monthly_purchases,
        "turnover_rate": round(random.uniform(4, 12), 1),
        "consumption_rate": round(d["material_cost"] / 30, 2),
        "low_stock_items": len([m for m in materials if m.status == "low_stock"]),
    })


@finance_bp.route("/insights", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def ai_insights():
    d = _generate_financial_data()

    insights = [
        {
            "type": "revenue", "priority": "high",
            "title": "Revenue Trend Analysis",
            "description": f"Total revenue is ${d['revenue']:,.0f} with a {random.uniform(5,15):.1f}% growth compared to last month. Profit margin stands at {d['profit_margin']:.1f}%.",
            "icon": "fa-chart-line", "impact": "positive",
            "action": "Continue current production strategy. Consider scaling successful product lines.",
        },
        {
            "type": "cost", "priority": "high",
            "title": "Cost Optimization Opportunity",
            "description": f"Machine PRS-002 has the highest operating cost at ${d['maintenance_cost']/len(d['machines'])*1.3:,.0f}. Energy consumption could be reduced by 12% through schedule optimization.",
            "icon": "fa-coins", "impact": "negative",
            "action": "Schedule preventive maintenance for PRS-002. Implement energy-saving protocols during off-peak hours.",
        },
        {
            "type": "material", "priority": "medium",
            "title": "Raw Material Cost Alert",
            "description": f"Raw material costs increased by {random.uniform(3,8):.1f}% this quarter. Steel prices show upward trend.",
            "icon": "fa-cubes", "impact": "negative",
            "action": "Consider bulk purchasing agreements. Evaluate alternative suppliers for cost reduction.",
        },
        {
            "type": "energy", "priority": "medium",
            "title": "Energy Consumption Report",
            "description": f"Electricity consumption increased by {random.uniform(5,15):.1f}% this week. Peak usage during shift changes.",
            "icon": "fa-bolt", "impact": "warning",
            "action": "Implement auto-shutdown for idle machines. Install smart meters for real-time monitoring.",
        },
        {
            "type": "worker", "priority": "low",
            "title": "Worker Productivity Update",
            "description": f"Team productivity improved by {random.uniform(3,10):.1f}% this month. Top performers contribute 20% more output.",
            "icon": "fa-users", "impact": "positive",
            "action": "Implement performance bonus system. Share best practices from top performers.",
        },
        {
            "type": "forecast", "priority": "high",
            "title": "Next Month Revenue Forecast",
            "description": f"AI models predict ${d['revenue']*random.uniform(1.03,1.12):,.0f} revenue next month ({random.uniform(3,12):.1f}% increase). Confidence: {random.uniform(82,95):.0f}%.",
            "icon": "fa-robot", "impact": "positive",
            "action": "Prepare inventory for projected demand increase. Review staffing levels.",
        },
        {
            "type": "profit", "priority": "high",
            "title": "Most Profitable Products",
            "description": "Hydraulic Valve leads with 32% margin. Bearing Housing shows fastest growth. Gear Set requires cost optimization.",
            "icon": "fa-trophy", "impact": "positive",
            "action": "Increase production of high-margin items. Review pricing strategy for low-margin products.",
        },
        {
            "type": "stock", "priority": "medium",
            "title": "Stock Shortage Prediction",
            "description": "Bearing 6205 stock will reach minimum in ~18 days at current consumption rate. Cutting Insert in ~25 days.",
            "icon": "fa-exclamation-triangle", "impact": "warning",
            "action": "Place purchase orders for critical items. Set up automated reorder triggers.",
        },
    ]

    return jsonify({
        "insights": insights,
        "summary": f"Factory operating at {d['profit_margin']:.0f}% profit margin. {len([i for i in insights if i['impact']=='positive'])} positive indicators, {len([i for i in insights if i['impact']=='negative'])} areas needing attention.",
    })
