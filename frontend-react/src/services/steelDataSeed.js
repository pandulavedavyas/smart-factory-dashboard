// Realistic Steel Manufacturing Plant Seed Data
// Contains 50 realistic workers, 35 specialized steel machines across 12 production stages, notifications, and 12 collections

export const STEEL_DEPARTMENTS = [
  'Steel Melting',
  'Rolling Mill',
  'Casting',
  'Heat Treatment',
  'Quality Control',
  'Packaging',
  'Warehouse',
  'Maintenance',
  'Utilities',
  'Administration'
];

export const STEEL_SHIFTS = ['Morning', 'Afternoon', 'Night'];

export const STEEL_ZONES = [
  'Zone A – Raw Material Yard',
  'Zone B – Blast Furnace',
  'Zone C – Steel Melting',
  'Zone D – Continuous Casting',
  'Zone E – Rolling Mill',
  'Zone F – Heat Treatment',
  'Zone G – Quality Inspection',
  'Zone H – Warehouse'
];

export const STEEL_DESIGNATIONS = [
  'Machine Operator',
  'Production Supervisor',
  'Shift Engineer',
  'Maintenance Technician',
  'Electrician',
  'Safety Officer',
  'Quality Inspector',
  'Warehouse Operator',
  'Production Manager'
];

// 12 Manufacturing Workflow Stages
export const SEED_MANUFACTURING_STAGES = [
  {
    id: 'stage-1',
    stageNumber: 1,
    name: 'Stage 1 – Raw Material Yard',
    description: 'Receives iron ore, scrap metal, limestone, and coal for stock grading.',
    zone: 'Zone A – Raw Material Yard',
    status: 'Running',
    icon: 'fa-cubes-stacked',
    machinesCount: 4
  },
  {
    id: 'stage-2',
    stageNumber: 2,
    name: 'Stage 2 – Blast Furnace',
    description: 'Smelts iron ore into high-purity molten pig iron at extreme temperatures.',
    zone: 'Zone B – Blast Furnace',
    status: 'Running',
    icon: 'fa-fire-flame-curved',
    machinesCount: 4
  },
  {
    id: 'stage-3',
    stageNumber: 3,
    name: 'Stage 3 – BOF / Electric Arc Furnace',
    description: 'Converts molten iron and scrap metal into refined liquid steel using carbon reduction.',
    zone: 'Zone C – Steel Melting',
    status: 'Running',
    icon: 'fa-dumpster-fire',
    machinesCount: 4
  },
  {
    id: 'stage-4',
    stageNumber: 4,
    name: 'Stage 4 – Ladle Refining',
    description: 'Adjusts molten steel chemistry, desulfurizes, and vacuums dissolved gases.',
    zone: 'Zone C – Steel Melting',
    status: 'Running',
    icon: 'fa-flask-vial',
    machinesCount: 3
  },
  {
    id: 'stage-5',
    stageNumber: 5,
    name: 'Stage 5 – Continuous Casting',
    description: 'Casts liquid steel continuously into solid steel billets and slabs.',
    zone: 'Zone D – Continuous Casting',
    status: 'Running',
    icon: 'fa-[#00E5FF]',
    machinesCount: 4
  },
  {
    id: 'stage-6',
    stageNumber: 6,
    name: 'Stage 6 – Billet Cutting',
    description: 'Precision hydraulic shearing and torch cutting of continuous billets to spec length.',
    zone: 'Zone D – Continuous Casting',
    status: 'Running',
    icon: 'fa-scissors',
    machinesCount: 2
  },
  {
    id: 'stage-7',
    stageNumber: 7,
    name: 'Stage 7 – Reheating Furnace',
    description: 'Uniformly reheats steel billets to rolling temperature (~1200°C) before deformation.',
    zone: 'Zone E – Rolling Mill',
    status: 'Running',
    icon: 'fa-temperature-high',
    machinesCount: 2
  },
  {
    id: 'stage-8',
    stageNumber: 8,
    name: 'Stage 8 – Rolling Mill',
    description: 'Hot-rolls billets into deformed rebar, structural I-beams, or sheet metal coils.',
    zone: 'Zone E – Rolling Mill',
    status: 'Running',
    icon: 'fa-gears',
    machinesCount: 4
  },
  {
    id: 'stage-9',
    stageNumber: 9,
    name: 'Stage 9 – Cooling Bed',
    description: 'Controlled air cooling bed to equalize internal steel crystalline structure.',
    zone: 'Zone E – Rolling Mill',
    status: 'Idle',
    icon: 'fa-wind',
    machinesCount: 2
  },
  {
    id: 'stage-10',
    stageNumber: 10,
    name: 'Stage 10 – Straightening',
    description: 'High-pressure multi-roller straightening to eliminate warp and internal strain.',
    zone: 'Zone E – Rolling Mill',
    status: 'Running',
    icon: 'fa-[#00D68F]',
    machinesCount: 1
  },
  {
    id: 'stage-11',
    stageNumber: 11,
    name: 'Stage 11 – Surface Inspection',
    description: 'Non-destructive ultrasonic and AI vision camera flaw detection.',
    zone: 'Zone G – Quality Inspection',
    status: 'Maintenance',
    icon: 'fa-microscope',
    machinesCount: 2
  },
  {
    id: 'stage-12',
    stageNumber: 12,
    name: 'Stage 12 – Packaging',
    description: 'Automated steel bundling, plastic wrapping, and barcode shipping dispatch.',
    zone: 'Zone H – Warehouse',
    status: 'Running',
    icon: 'fa-box-open',
    machinesCount: 3
  }
];

// 35 Specialized Steel Machines across all 12 Stages
export const SEED_MACHINES = [
  // Stage 1 - Raw Material Yard
  {
    machineId: 'MCH-101',
    machineName: 'Raw Material Hopper',
    stageId: 'stage-1',
    stageName: 'Stage 1 – Raw Material Yard',
    role: 'Receives and stores raw iron ore pellets and coking coal',
    zone: 'Zone A – Raw Material Yard',
    operator: 'Liam O’Connor',
    power: 'ON',
    status: 'Running',
    temperature: 35,
    health: 96,
    workingHours: 9400,
    rpm: 0,
    efficiency: 98.2,
    powerConsumption: 210,
    capacity: '500 Tons/h',
    materialFlow: '480 Tons/h',
    lastMaintenance: '2026-07-10',
    nextMaintenance: '2026-08-10'
  },
  {
    machineId: 'MCH-102',
    machineName: 'Conveyor Belt System',
    stageId: 'stage-1',
    stageName: 'Stage 1 – Raw Material Yard',
    role: 'Transfers raw materials from yard to blast furnace charging hopper',
    zone: 'Zone A – Raw Material Yard',
    operator: 'Priya Nair',
    power: 'ON',
    status: 'Running',
    temperature: 42,
    health: 97,
    workingHours: 10400,
    rpm: 120,
    efficiency: 98.5,
    powerConsumption: 140,
    capacity: '600 Tons/h',
    materialFlow: '510 Tons/h',
    lastMaintenance: '2026-07-17',
    nextMaintenance: '2026-08-17'
  },
  {
    machineId: 'MCH-103',
    machineName: 'Magnetic Separator',
    stageId: 'stage-1',
    stageName: 'Stage 1 – Raw Material Yard',
    role: 'Extracts tramp iron and metallic debris from incoming raw coal',
    zone: 'Zone A – Raw Material Yard',
    operator: 'Oscar Berg',
    power: 'ON',
    status: 'Running',
    temperature: 55,
    health: 93,
    workingHours: 6200,
    rpm: 45,
    efficiency: 95.0,
    powerConsumption: 310,
    capacity: '400 Tons/h',
    materialFlow: '380 Tons/h',
    lastMaintenance: '2026-07-02',
    nextMaintenance: '2026-08-02'
  },
  {
    machineId: 'MCH-104',
    machineName: 'Vibrating Screen',
    stageId: 'stage-1',
    stageName: 'Stage 1 – Raw Material Yard',
    role: 'Filters lump ore sizes for optimal furnace permeability',
    zone: 'Zone A – Raw Material Yard',
    operator: 'Deepak Joshi',
    power: 'ON',
    status: 'Running',
    temperature: 38,
    health: 91,
    workingHours: 4150,
    rpm: 850,
    efficiency: 94.2,
    powerConsumption: 180,
    capacity: '450 Tons/h',
    materialFlow: '430 Tons/h',
    lastMaintenance: '2026-07-15',
    nextMaintenance: '2026-08-15'
  },

  // Stage 2 - Blast Furnace
  {
    machineId: 'MCH-001',
    machineName: 'Blast Furnace',
    stageId: 'stage-2',
    stageName: 'Stage 2 – Blast Furnace',
    role: 'Melts iron ore into liquid pig iron at 1500°C',
    zone: 'Zone B – Blast Furnace',
    operator: 'Rajesh Sharma',
    power: 'ON',
    status: 'Running',
    temperature: 1485,
    health: 94,
    workingHours: 8420,
    rpm: 120,
    efficiency: 96.5,
    powerConsumption: 1850,
    pressure: '3.4 Bar',
    fuelConsumption: '480 kg/Ton',
    lastMaintenance: '2026-07-10',
    nextMaintenance: '2026-08-10'
  },
  {
    machineId: 'MCH-202',
    machineName: 'Hot Blast Stove',
    stageId: 'stage-2',
    stageName: 'Stage 2 – Blast Furnace',
    role: 'Preheats air blast to 1200°C for intense coke combustion',
    zone: 'Zone B – Blast Furnace',
    operator: 'Rohan Deshmukh',
    power: 'ON',
    status: 'Running',
    temperature: 1210,
    health: 92,
    workingHours: 7900,
    rpm: 0,
    efficiency: 95.8,
    powerConsumption: 920,
    pressure: '3.2 Bar',
    fuelConsumption: '210 m³/h',
    lastMaintenance: '2026-07-08',
    nextMaintenance: '2026-08-08'
  },
  {
    machineId: 'MCH-203',
    machineName: 'Top Charging System',
    stageId: 'stage-2',
    stageName: 'Stage 2 – Blast Furnace',
    role: 'Bell-less distributor for layer charging of ore and coke',
    zone: 'Zone B – Blast Furnace',
    operator: 'Tariq Al-Rashid',
    power: 'ON',
    status: 'Running',
    temperature: 240,
    health: 89,
    workingHours: 6300,
    rpm: 60,
    efficiency: 93.5,
    powerConsumption: 340,
    capacity: '350 Tons/h',
    lastMaintenance: '2026-07-12',
    nextMaintenance: '2026-08-12'
  },
  {
    machineId: 'MCH-204',
    machineName: 'Gas Cleaning Unit',
    stageId: 'stage-2',
    stageName: 'Stage 2 – Blast Furnace',
    role: 'Scrubs dust and collects combustible blast furnace gas',
    zone: 'Zone B – Blast Furnace',
    operator: 'Arjun Mehta',
    power: 'ON',
    status: 'Running',
    temperature: 180,
    health: 95,
    workingHours: 8100,
    rpm: 1450,
    efficiency: 97.4,
    powerConsumption: 420,
    pressure: '1.2 Bar',
    lastMaintenance: '2026-07-14',
    nextMaintenance: '2026-08-14'
  },

  // Stage 3 - BOF / Electric Arc Furnace
  {
    machineId: 'MCH-002',
    machineName: 'Electric Arc Furnace',
    stageId: 'stage-3',
    stageName: 'Stage 3 – BOF / Electric Arc Furnace',
    role: 'Produces steel from recycled scrap metal at 1600°C',
    zone: 'Zone C – Steel Melting',
    operator: 'Viktor Petrov',
    power: 'ON',
    status: 'Running',
    temperature: 1580,
    health: 91,
    workingHours: 7200,
    rpm: 0,
    efficiency: 93.8,
    powerConsumption: 2400,
    oxygenLevel: '99.5%',
    steelGrade: 'High Carbon SS-304',
    lastMaintenance: '2026-07-12',
    nextMaintenance: '2026-08-12'
  },
  {
    machineId: 'MCH-302',
    machineName: 'Basic Oxygen Furnace',
    stageId: 'stage-3',
    stageName: 'Stage 3 – BOF / Electric Arc Furnace',
    role: 'Converts molten iron into crude steel by blowing high-purity oxygen',
    zone: 'Zone C – Steel Melting',
    operator: 'Sanjay Verma',
    power: 'ON',
    status: 'Running',
    temperature: 1620,
    health: 93,
    workingHours: 8500,
    rpm: 0,
    efficiency: 96.1,
    powerConsumption: 1100,
    oxygenLevel: '99.8%',
    steelGrade: 'Structural Fe-500D',
    lastMaintenance: '2026-07-09',
    nextMaintenance: '2026-08-09'
  },
  {
    machineId: 'MCH-303',
    machineName: 'Scrap Charging System',
    stageId: 'stage-3',
    stageName: 'Stage 3 – BOF / Electric Arc Furnace',
    role: 'Heavy crane bucket for charging recycled heavy metal scrap',
    zone: 'Zone C – Steel Melting',
    operator: 'Ivan Sokolov',
    power: 'ON',
    status: 'Running',
    temperature: 65,
    health: 88,
    workingHours: 5400,
    rpm: 90,
    efficiency: 92.0,
    powerConsumption: 380,
    capacity: '120 Tons/bucket',
    lastMaintenance: '2026-07-05',
    nextMaintenance: '2026-08-05'
  },
  {
    machineId: 'MCH-304',
    machineName: 'Water-Cooled Oxygen Lance',
    stageId: 'stage-3',
    stageName: 'Stage 3 – BOF / Electric Arc Furnace',
    role: 'Injects supersonic oxygen stream into molten steel bath',
    zone: 'Zone C – Steel Melting',
    operator: 'Siddharth Patel',
    power: 'ON',
    status: 'Running',
    temperature: 850,
    health: 94,
    workingHours: 4800,
    rpm: 0,
    efficiency: 97.0,
    oxygenLevel: '99.9%',
    pressure: '12 Bar',
    lastMaintenance: '2026-07-16',
    nextMaintenance: '2026-08-16'
  },

  // Stage 4 - Ladle Refining
  {
    machineId: 'MCH-003',
    machineName: 'Ladle Furnace',
    stageId: 'stage-4',
    stageName: 'Stage 4 – Ladle Refining',
    role: 'Refines molten steel composition and desulfurizes',
    zone: 'Zone C – Steel Melting',
    operator: 'Elena Rostova',
    power: 'ON',
    status: 'Running',
    temperature: 1520,
    health: 89,
    workingHours: 6540,
    rpm: 45,
    efficiency: 95.0,
    powerConsumption: 1650,
    refiningTime: '35 mins',
    alloyConsumption: '4.2 kg/Ton',
    lastMaintenance: '2026-07-14',
    nextMaintenance: '2026-08-14'
  },
  {
    machineId: 'MCH-402',
    machineName: 'Vacuum Degasser (VD)',
    stageId: 'stage-4',
    stageName: 'Stage 4 – Ladle Refining',
    role: 'Removes hydrogen and nitrogen gas from ultra-pure steel',
    zone: 'Zone C – Steel Melting',
    operator: 'Sunita Rao',
    power: 'ON',
    status: 'Running',
    temperature: 1490,
    health: 96,
    workingHours: 5100,
    rpm: 0,
    efficiency: 97.8,
    powerConsumption: 890,
    pressure: '0.002 Bar (Vacuum)',
    refiningTime: '22 mins',
    lastMaintenance: '2026-07-11',
    nextMaintenance: '2026-08-11'
  },
  {
    machineId: 'MCH-403',
    machineName: 'Alloy Feeding System',
    stageId: 'stage-4',
    stageName: 'Stage 4 – Ladle Refining',
    role: 'Precise computer-controlled addition of Ferro-Silicon & Manganese',
    zone: 'Zone C – Steel Melting',
    operator: 'Vikram Singh',
    power: 'ON',
    status: 'Running',
    temperature: 45,
    health: 95,
    workingHours: 3900,
    rpm: 180,
    efficiency: 98.4,
    powerConsumption: 120,
    alloyConsumption: '12.5 kg/min',
    lastMaintenance: '2026-07-18',
    nextMaintenance: '2026-08-18'
  },

  // Stage 5 - Continuous Casting
  {
    machineId: 'MCH-004',
    machineName: 'Continuous Casting Machine',
    stageId: 'stage-5',
    stageName: 'Stage 5 – Continuous Casting',
    role: 'Solidifies liquid steel continuously into strand billets',
    zone: 'Zone D – Continuous Casting',
    operator: 'Marcus Vance',
    power: 'ON',
    status: 'Running',
    temperature: 1240,
    health: 96,
    workingHours: 5890,
    rpm: 180,
    efficiency: 97.2,
    powerConsumption: 980,
    castingSpeed: '2.4 m/min',
    moldTemp: '1150°C',
    coolingWaterFlow: '420 L/min',
    lastMaintenance: '2026-07-15',
    nextMaintenance: '2026-08-15'
  },
  {
    machineId: 'MCH-502',
    machineName: 'Water-Cooled Copper Mold',
    stageId: 'stage-5',
    stageName: 'Stage 5 – Continuous Casting',
    role: 'Primary solidifying shell formation for liquid steel strand',
    zone: 'Zone D – Continuous Casting',
    operator: 'Benjamin Hayes',
    power: 'ON',
    status: 'Running',
    temperature: 980,
    health: 94,
    workingHours: 4600,
    rpm: 0,
    efficiency: 96.0,
    coolingWaterFlow: '580 L/min',
    moldTemp: '980°C',
    lastMaintenance: '2026-07-13',
    nextMaintenance: '2026-08-13'
  },
  {
    machineId: 'MCH-503',
    machineName: 'Secondary Spray Cooling Zone',
    stageId: 'stage-5',
    stageName: 'Stage 5 – Continuous Casting',
    role: 'High-pressure water mist nozzles cool core steel billet',
    zone: 'Zone D – Continuous Casting',
    operator: 'Jacob Lindqvist',
    power: 'ON',
    status: 'Running',
    temperature: 640,
    health: 91,
    workingHours: 6100,
    rpm: 0,
    efficiency: 94.5,
    coolingWaterFlow: '750 L/min',
    lastMaintenance: '2026-07-07',
    nextMaintenance: '2026-08-07'
  },
  {
    machineId: 'MCH-504',
    machineName: 'Strand Roller Table',
    stageId: 'stage-5',
    stageName: 'Stage 5 – Continuous Casting',
    role: 'Supports and curves red-hot solidifying steel strand onto bed',
    zone: 'Zone D – Continuous Casting',
    operator: 'Manish Kumar',
    power: 'ON',
    status: 'Running',
    temperature: 520,
    health: 93,
    workingHours: 7100,
    rpm: 140,
    efficiency: 95.8,
    powerConsumption: 260,
    castingSpeed: '2.4 m/min',
    lastMaintenance: '2026-07-09',
    nextMaintenance: '2026-08-09'
  },

  // Stage 6 - Billet Cutting
  {
    machineId: 'MCH-005',
    machineName: 'Billet Cutting Machine',
    stageId: 'stage-6',
    stageName: 'Stage 6 – Billet Cutting',
    role: 'Torch-cuts red hot billets into 6-meter standardized lengths',
    zone: 'Zone D – Continuous Casting',
    operator: 'Dave Miller',
    power: 'ON',
    status: 'Running',
    temperature: 410,
    health: 92,
    workingHours: 4320,
    rpm: 1450,
    efficiency: 94.0,
    powerConsumption: 320,
    bladeTemp: '380°C',
    cuttingSpeed: '12 cuts/min',
    billetsProduced: 1420,
    lastMaintenance: '2026-07-08',
    nextMaintenance: '2026-08-08'
  },
  {
    machineId: 'MCH-602',
    machineName: 'Heavy Hydraulic Billet Shear',
    stageId: 'stage-6',
    stageName: 'Stage 6 – Billet Cutting',
    role: 'Cold shear cutting of special high-strength steel alloy billets',
    zone: 'Zone D – Continuous Casting',
    operator: 'Ethan Hunt',
    power: 'ON',
    status: 'Running',
    temperature: 95,
    health: 89,
    workingHours: 3850,
    rpm: 320,
    efficiency: 92.5,
    powerConsumption: 490,
    bladeTemp: '85°C',
    cuttingSpeed: '8 cuts/min',
    billetsProduced: 980,
    lastMaintenance: '2026-07-04',
    nextMaintenance: '2026-08-04'
  },

  // Stage 7 - Reheating Furnace
  {
    machineId: 'MCH-006',
    machineName: 'Reheating Furnace',
    stageId: 'stage-7',
    stageName: 'Stage 7 – Reheating Furnace',
    role: 'Uniformly reheats cold steel billets to 1180°C for rolling',
    zone: 'Zone E – Rolling Mill',
    operator: 'Anil Kulkarni',
    power: 'ON',
    status: 'Running',
    temperature: 1180,
    health: 87,
    workingHours: 7910,
    rpm: 60,
    efficiency: 91.5,
    powerConsumption: 1420,
    fuelConsumption: '340 m³/h Gas',
    steelTemp: '1150°C',
    lastMaintenance: '2026-07-01',
    nextMaintenance: '2026-08-01'
  },
  {
    machineId: 'MCH-702',
    machineName: 'Walking Beam Burner Array',
    stageId: 'stage-7',
    stageName: 'Stage 7 – Reheating Furnace',
    role: 'Moves billets step-by-step through multi-zone natural gas burners',
    zone: 'Zone E – Rolling Mill',
    operator: 'Freja Nielsen',
    power: 'ON',
    status: 'Running',
    temperature: 1220,
    health: 90,
    workingHours: 6400,
    rpm: 30,
    efficiency: 93.0,
    powerConsumption: 680,
    fuelConsumption: '290 m³/h Gas',
    lastMaintenance: '2026-07-14',
    nextMaintenance: '2026-08-14'
  },

  // Stage 8 - Rolling Mill
  {
    machineId: 'MCH-007',
    machineName: 'Rolling Mill',
    stageId: 'stage-8',
    stageName: 'Stage 8 – Rolling Mill',
    role: 'Shapes white-hot billets into TMT rebar and steel coils',
    zone: 'Zone E – Rolling Mill',
    operator: 'Sophia Chen',
    power: 'ON',
    status: 'Running',
    temperature: 940,
    health: 95,
    workingHours: 8100,
    rpm: 850,
    efficiency: 96.8,
    powerConsumption: 1950,
    rollSpeed: '18 m/s',
    rollingForce: '14,500 kN',
    productThickness: '16 mm',
    lastMaintenance: '2026-07-16',
    nextMaintenance: '2026-08-16'
  },
  {
    machineId: 'MCH-802',
    machineName: 'Roughing Mill Stand',
    stageId: 'stage-8',
    stageName: 'Stage 8 – Rolling Mill',
    role: 'First heavy reduction pass of reheated billet cross section',
    zone: 'Zone E – Rolling Mill',
    operator: 'Gautam Reddy',
    power: 'ON',
    status: 'Running',
    temperature: 1050,
    health: 93,
    workingHours: 7400,
    rpm: 420,
    efficiency: 95.2,
    powerConsumption: 1600,
    rollingForce: '22,000 kN',
    productThickness: '65 mm',
    lastMaintenance: '2026-07-12',
    nextMaintenance: '2026-08-12'
  },
  {
    machineId: 'MCH-803',
    machineName: 'Finishing Mill Block',
    stageId: 'stage-8',
    stageName: 'Stage 8 – Rolling Mill',
    role: 'High-speed precision roll stand for final rebar ribbing',
    zone: 'Zone E – Rolling Mill',
    operator: 'Lucas Meyer',
    power: 'ON',
    status: 'Running',
    temperature: 880,
    health: 94,
    workingHours: 6900,
    rpm: 1450,
    efficiency: 96.4,
    powerConsumption: 1250,
    rollSpeed: '32 m/s',
    productThickness: '12 mm',
    lastMaintenance: '2026-07-17',
    nextMaintenance: '2026-08-17'
  },
  {
    machineId: 'MCH-804',
    machineName: 'Water Quenching System (Thermex)',
    stageId: 'stage-8',
    stageName: 'Stage 8 – Rolling Mill',
    role: 'Rapid water quenching creates hard martensitic outer rebar rim',
    zone: 'Zone E – Rolling Mill',
    operator: 'Yusuf Erdogan',
    power: 'ON',
    status: 'Running',
    temperature: 420,
    health: 96,
    workingHours: 5800,
    rpm: 0,
    efficiency: 97.5,
    coolingWaterFlow: '950 L/min',
    lastMaintenance: '2026-07-11',
    nextMaintenance: '2026-08-11'
  },

  // Stage 9 - Cooling Bed
  {
    machineId: 'MCH-008',
    machineName: 'Rake Cooling Bed',
    stageId: 'stage-9',
    stageName: 'Stage 9 – Cooling Bed',
    role: 'Transfers hot rolled rebar while air cooling to room temp',
    zone: 'Zone E – Rolling Mill',
    operator: 'Klaus Webber',
    power: 'ON',
    status: 'Idle',
    temperature: 310,
    health: 98,
    workingHours: 3400,
    rpm: 120,
    efficiency: 99.0,
    powerConsumption: 180,
    coolingTemp: '120°C',
    coolingTime: '24 mins',
    lastMaintenance: '2026-07-18',
    nextMaintenance: '2026-08-18'
  },
  {
    machineId: 'MCH-902',
    machineName: 'Chain Transfer Table',
    stageId: 'stage-9',
    stageName: 'Stage 9 – Cooling Bed',
    role: 'Aligns cooled steel bars into bundles before straightening',
    zone: 'Zone E – Rolling Mill',
    operator: 'Carlos Gomez',
    power: 'ON',
    status: 'Running',
    temperature: 110,
    health: 95,
    workingHours: 4200,
    rpm: 80,
    efficiency: 96.0,
    powerConsumption: 150,
    coolingTime: '15 mins',
    lastMaintenance: '2026-07-06',
    nextMaintenance: '2026-08-06'
  },

  // Stage 10 - Straightening
  {
    machineId: 'MCH-009',
    machineName: 'Multi-Roll Straightening Machine',
    stageId: 'stage-10',
    stageName: 'Stage 10 – Straightening',
    role: 'Eliminates bend curvature from cooled steel bars',
    zone: 'Zone E – Rolling Mill',
    operator: 'Carlos Gomez',
    power: 'ON',
    status: 'Running',
    temperature: 85,
    health: 90,
    workingHours: 4120,
    rpm: 600,
    efficiency: 92.4,
    powerConsumption: 240,
    rollerPressure: '45 Bar',
    productAlignment: '99.8% Straight',
    lastMaintenance: '2026-07-05',
    nextMaintenance: '2026-08-05'
  },

  // Stage 11 - Surface Inspection
  {
    machineId: 'MCH-010',
    machineName: 'Surface Grinding Machine',
    stageId: 'stage-11',
    stageName: 'Stage 11 – Surface Inspection',
    role: 'Grinds out minor surface seams and micro-defects',
    zone: 'Zone F – Heat Treatment',
    operator: 'Aisha Al-Mansoor',
    power: 'OFF',
    status: 'Maintenance',
    temperature: 68,
    health: 62,
    workingHours: 5230,
    rpm: 2400,
    efficiency: 78.5,
    powerConsumption: 190,
    surfaceDefects: 12,
    qualityScore: '84.5%',
    lastMaintenance: '2026-07-20',
    nextMaintenance: '2026-07-27'
  },
  {
    machineId: 'MCH-1102',
    machineName: 'AI Camera & Ultrasonic Inspection',
    stageId: 'stage-11',
    stageName: 'Stage 11 – Surface Inspection',
    role: 'Automated high-speed vision flaw detection and internal crack probe',
    zone: 'Zone G – Quality Inspection',
    operator: 'Alexander Wright',
    power: 'ON',
    status: 'Running',
    temperature: 42,
    health: 97,
    workingHours: 3900,
    rpm: 0,
    efficiency: 98.6,
    powerConsumption: 90,
    surfaceDefects: 2,
    qualityScore: '99.4%',
    lastMaintenance: '2026-07-16',
    nextMaintenance: '2026-08-16'
  },

  // Stage 12 - Packaging
  {
    machineId: 'MCH-015',
    machineName: 'Automated Bundling Machine',
    stageId: 'stage-12',
    stageName: 'Stage 12 – Packaging',
    role: 'Straps and wire-ties steel rebar into 2-ton commercial bundles',
    zone: 'Zone H – Warehouse',
    operator: 'Gabriel Santos',
    power: 'ON',
    status: 'Running',
    temperature: 48,
    health: 96,
    workingHours: 3100,
    rpm: 450,
    efficiency: 97.4,
    powerConsumption: 210,
    bundlesProduced: 240,
    packageWeight: '2.0 Tons/bundle',
    dispatchStatus: 'Ready for Dispatch',
    lastMaintenance: '2026-07-19',
    nextMaintenance: '2026-08-19'
  },
  {
    machineId: 'MCH-1202',
    machineName: 'Coil Wrapping Machine',
    stageId: 'stage-12',
    stageName: 'Stage 12 – Packaging',
    role: 'Applies protective polymer film around hot rolled steel coils',
    zone: 'Zone H – Warehouse',
    operator: 'Chloe Dubois',
    power: 'ON',
    status: 'Running',
    temperature: 36,
    health: 95,
    workingHours: 2800,
    rpm: 380,
    efficiency: 96.8,
    powerConsumption: 160,
    bundlesProduced: 110,
    packageWeight: '4.5 Tons/coil',
    dispatchStatus: 'Staging Yard B',
    lastMaintenance: '2026-07-17',
    nextMaintenance: '2026-08-17'
  },
  {
    machineId: 'MCH-1203',
    machineName: 'Barcode & RFID Shipping Printer',
    stageId: 'stage-12',
    stageName: 'Stage 12 – Packaging',
    role: 'Tags each steel bundle with heat-resistant mill tracking QR tag',
    zone: 'Zone H – Warehouse',
    operator: 'Ines Laurent',
    power: 'ON',
    status: 'Running',
    temperature: 30,
    health: 99,
    workingHours: 1900,
    rpm: 0,
    efficiency: 99.5,
    powerConsumption: 45,
    bundlesProduced: 350,
    dispatchStatus: 'Manifest Printed',
    lastMaintenance: '2026-07-18',
    nextMaintenance: '2026-08-18'
  }
];

// Helper to generate 50 realistic workers
function generate50Workers() {
  const names = [
    { name: 'Rajesh Sharma', dept: 'Steel Melting', desig: 'Shift Engineer', zone: 'Zone B – Blast Furnace', machine: 'Blast Furnace' },
    { name: 'Viktor Petrov', dept: 'Steel Melting', desig: 'Machine Operator', zone: 'Zone C – Steel Melting', machine: 'Electric Arc Furnace' },
    { name: 'Elena Rostova', dept: 'Steel Melting', desig: 'Machine Operator', zone: 'Zone C – Steel Melting', machine: 'Ladle Furnace' },
    { name: 'Marcus Vance', dept: 'Casting', desig: 'Shift Engineer', zone: 'Zone D – Continuous Casting', machine: 'Continuous Casting Machine' },
    { name: 'Dave Miller', dept: 'Casting', desig: 'Machine Operator', zone: 'Zone D – Continuous Casting', machine: 'Billet Cutting Machine' },
    { name: 'Anil Kulkarni', dept: 'Rolling Mill', desig: 'Production Supervisor', zone: 'Zone E – Rolling Mill', machine: 'Reheating Furnace' },
    { name: 'Sophia Chen', dept: 'Rolling Mill', desig: 'Machine Operator', zone: 'Zone E – Rolling Mill', machine: 'Rolling Mill' },
    { name: 'Klaus Webber', dept: 'Rolling Mill', desig: 'Machine Operator', zone: 'Zone E – Rolling Mill', machine: 'Rake Cooling Bed' },
    { name: 'Carlos Gomez', dept: 'Rolling Mill', desig: 'Machine Operator', zone: 'Zone E – Rolling Mill', machine: 'Multi-Roll Straightening Machine' },
    { name: 'Aisha Al-Mansoor', dept: 'Heat Treatment', desig: 'Maintenance Technician', zone: 'Zone F – Heat Treatment', machine: 'Surface Grinding Machine' },
    { name: 'Dmitry Ivanov', dept: 'Heat Treatment', desig: 'Machine Operator', zone: 'Zone F – Heat Treatment', machine: 'Shot Blasting Machine' },
    { name: 'Hannah Abbott', dept: 'Rolling Mill', desig: 'Machine Operator', zone: 'Zone E – Rolling Mill', machine: 'Hydraulic Press' },
    { name: 'Liam O’Connor', dept: 'Warehouse', desig: 'Warehouse Operator', zone: 'Zone A – Raw Material Yard', machine: 'Raw Material Hopper' },
    { name: 'Priya Nair', dept: 'Utilities', desig: 'Electrician', zone: 'Zone A – Raw Material Yard', machine: 'Conveyor Belt System' },
    { name: 'Gabriel Santos', dept: 'Packaging', desig: 'Warehouse Operator', zone: 'Zone H – Warehouse', machine: 'Automated Bundling Machine' },
    { name: 'Alexander Wright', dept: 'Quality Control', desig: 'Quality Inspector', zone: 'Zone G – Quality Inspection', machine: 'AI Camera & Ultrasonic Inspection' },
    { name: 'Mei-Ling Zhou', dept: 'Quality Control', desig: 'Quality Inspector', zone: 'Zone G – Quality Inspection', machine: 'None' },
    { name: 'Tariq Al-Rashid', dept: 'Administration', desig: 'Safety Officer', zone: 'Zone B – Blast Furnace', machine: 'Top Charging System' },
    { name: 'Siddharth Patel', dept: 'Maintenance', desig: 'Maintenance Technician', zone: 'Zone C – Steel Melting', machine: 'Water-Cooled Oxygen Lance' },
    { name: 'Lucas Meyer', dept: 'Maintenance', desig: 'Electrician', zone: 'Zone E – Rolling Mill', machine: 'Finishing Mill Block' },
    { name: 'Sanjay Verma', dept: 'Steel Melting', desig: 'Production Supervisor', zone: 'Zone C – Steel Melting', machine: 'Basic Oxygen Furnace' },
    { name: 'Olga Koroleva', dept: 'Administration', desig: 'Production Manager', zone: 'Zone H – Warehouse', machine: 'None' },
    { name: 'Benjamin Hayes', dept: 'Casting', desig: 'Machine Operator', zone: 'Zone D – Continuous Casting', machine: 'Water-Cooled Copper Mold' },
    { name: 'Zoya Khan', dept: 'Quality Control', desig: 'Quality Inspector', zone: 'Zone G – Quality Inspection', machine: 'None' },
    { name: 'Mateo Rossi', dept: 'Heat Treatment', desig: 'Shift Engineer', zone: 'Zone F – Heat Treatment', machine: 'Surface Grinding Machine' },
    { name: 'Chloe Dubois', dept: 'Packaging', desig: 'Machine Operator', zone: 'Zone H – Warehouse', machine: 'Coil Wrapping Machine' },
    { name: 'Rohan Deshmukh', dept: 'Steel Melting', desig: 'Machine Operator', zone: 'Zone B – Blast Furnace', machine: 'Hot Blast Stove' },
    { name: 'Nadia Kowalski', dept: 'Warehouse', desig: 'Warehouse Operator', zone: 'Zone H – Warehouse', machine: 'None' },
    { name: 'Ethan Hunt', dept: 'Maintenance', desig: 'Maintenance Technician', zone: 'Zone D – Continuous Casting', machine: 'Heavy Hydraulic Billet Shear' },
    { name: 'Fatima Zahra', dept: 'Utilities', desig: 'Electrician', zone: 'Zone B – Blast Furnace', machine: 'None' },
    { name: 'Yusuf Erdogan', dept: 'Rolling Mill', desig: 'Machine Operator', zone: 'Zone E – Rolling Mill', machine: 'Water Quenching System (Thermex)' },
    { name: 'Sunita Rao', dept: 'Steel Melting', desig: 'Quality Inspector', zone: 'Zone C – Steel Melting', machine: 'Vacuum Degasser (VD)' },
    { name: 'Jacob Lindqvist', dept: 'Casting', desig: 'Machine Operator', zone: 'Zone D – Continuous Casting', machine: 'Secondary Spray Cooling Zone' },
    { name: 'Amara Okafor', dept: 'Heat Treatment', desig: 'Machine Operator', zone: 'Zone F – Heat Treatment', machine: 'Surface Grinding Machine' },
    { name: 'Gautam Reddy', dept: 'Rolling Mill', desig: 'Shift Engineer', zone: 'Zone E – Rolling Mill', machine: 'Roughing Mill Stand' },
    { name: 'Isabella Silva', dept: 'Packaging', desig: 'Production Supervisor', zone: 'Zone H – Warehouse', machine: 'Barcode & RFID Shipping Printer' },
    { name: 'Deepak Joshi', dept: 'Maintenance', desig: 'Electrician', zone: 'Zone A – Raw Material Yard', machine: 'Vibrating Screen' },
    { name: 'Camila Hernandez', dept: 'Quality Control', desig: 'Quality Inspector', zone: 'Zone G – Quality Inspection', machine: 'None' },
    { name: 'Ivan Sokolov', dept: 'Steel Melting', desig: 'Machine Operator', zone: 'Zone C – Steel Melting', machine: 'Scrap Charging System' },
    { name: 'Kavita Menon', dept: 'Administration', desig: 'Safety Officer', zone: 'Zone E – Rolling Mill', machine: 'None' },
    { name: 'Oscar Berg', dept: 'Warehouse', desig: 'Warehouse Operator', zone: 'Zone A – Raw Material Yard', machine: 'Magnetic Separator' },
    { name: 'Zara Ahmed', dept: 'Heat Treatment', desig: 'Machine Operator', zone: 'Zone F – Heat Treatment', machine: 'Surface Grinding Machine' },
    { name: 'Manish Kumar', dept: 'Casting', desig: 'Shift Engineer', zone: 'Zone D – Continuous Casting', machine: 'Strand Roller Table' },
    { name: 'Freja Nielsen', dept: 'Rolling Mill', desig: 'Machine Operator', zone: 'Zone E – Rolling Mill', machine: 'Walking Beam Burner Array' },
    { name: 'Arjun Mehta', dept: 'Steel Melting', desig: 'Maintenance Technician', zone: 'Zone B – Blast Furnace', machine: 'Gas Cleaning Unit' },
    { name: 'Ines Laurent', dept: 'Packaging', desig: 'Machine Operator', zone: 'Zone H – Warehouse', machine: 'Barcode & RFID Shipping Printer' },
    { name: 'Tarik Benali', dept: 'Warehouse', desig: 'Warehouse Operator', zone: 'Zone H – Warehouse', machine: 'None' },
    { name: 'Pooja Hegde', dept: 'Quality Control', desig: 'Quality Inspector', zone: 'Zone G – Quality Inspection', machine: 'None' },
    { name: 'Dominic Shaw', dept: 'Utilities', desig: 'Electrician', zone: 'Zone F – Heat Treatment', machine: 'None' },
    { name: 'Vikram Singh', dept: 'Administration', desig: 'Production Manager', zone: 'Zone C – Steel Melting', machine: 'Alloy Feeding System' }
  ];

  const shifts = ['Morning', 'Afternoon', 'Night'];
  const statuses = ['Active', 'Active', 'Active', 'Break', 'Active', 'Offline'];

  return names.map((item, index) => {
    const idNum = 1001 + index;
    const empId = `EMP${idNum}`;
    const emailName = item.name.toLowerCase().replace(/[^a-z]/g, '.');
    const shift = shifts[index % 3];
    const status = statuses[index % statuses.length];
    const attendance = parseFloat((92 + (index % 8) * 0.9).toFixed(1));
    const workingHours = status === 'Offline' ? 0 : status === 'Break' ? 6 : 8;
    const overtime = (index % 4 === 0) ? 1.5 : 0;
    const experience = 3 + (index % 12);
    const year = 2018 + (index % 6);
    const month = String(1 + (index % 12)).padStart(2, '0');
    const day = String(1 + (index % 28)).padStart(2, '0');

    return {
      employeeId: empId,
      name: item.name,
      email: `${emailName}@smartfactory.com`,
      password: 'worker@123',
      department: item.dept,
      designation: item.desig,
      zone: item.zone,
      assignedMachine: item.machine,
      shift,
      attendance,
      workingHours,
      overtime,
      experience,
      joiningDate: `${year}-${month}-${day}`,
      phone: `+1 (555) ${100 + index}-${2000 + index * 3}`,
      status,
      performanceScore: 82 + (index % 17),
      role: 'worker'
    };
  });
}

export const SEED_WORKERS = generate50Workers();

// Seed Notifications with Severity Colors
export const SEED_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    title: 'Machine Stopped Unexpectedly',
    message: 'Surface Grinding Machine (MCH-010) has stopped unexpectedly.',
    severity: 'red', // red, orange, yellow, green
    severityLabel: 'Critical',
    timestamp: '2026-07-21 09:42:15',
    read: false,
    machineId: 'MCH-010',
    stageName: 'Stage 11 – Surface Inspection'
  },
  {
    id: 'NOTIF-002',
    title: 'High Thermal Limit Reached',
    message: 'Blast Furnace (MCH-001) temperature reached 1485°C, approaching upper safe limit.',
    severity: 'orange',
    severityLabel: 'Maintenance Required',
    timestamp: '2026-07-21 09:15:00',
    read: false,
    machineId: 'MCH-001',
    stageName: 'Stage 2 – Blast Furnace'
  },
  {
    id: 'NOTIF-003',
    title: 'Cooling Flow Warning',
    message: 'Cooling Water Flow in Secondary Spray (MCH-503) is slightly below standard operating threshold.',
    severity: 'yellow',
    severityLabel: 'Warning',
    timestamp: '2026-07-21 08:30:10',
    read: true,
    machineId: 'MCH-503',
    stageName: 'Stage 5 – Continuous Casting'
  },
  {
    id: 'NOTIF-004',
    title: 'Stage Production Optimal',
    message: 'Rolling Mill (MCH-007) achieved 102.5% hourly output target.',
    severity: 'green',
    severityLabel: 'Normal',
    timestamp: '2026-07-21 07:00:00',
    read: true,
    machineId: 'MCH-007',
    stageName: 'Stage 8 – Rolling Mill'
  }
];

// Production collection seed
export const SEED_PRODUCTION = [
  { id: 'PROD-101', date: '2026-07-15', productType: 'Steel Billets 150x150', quantityTons: 1450, targetTons: 1500, shift: 'Morning', machineId: 'MCH-004', efficiency: 96.6, scrapQtyTons: 12 },
  { id: 'PROD-102', date: '2026-07-16', productType: 'Deformed Steel Rebar 16mm', quantityTons: 1620, targetTons: 1600, shift: 'Morning', machineId: 'MCH-007', efficiency: 101.2, scrapQtyTons: 8 },
  { id: 'PROD-103', date: '2026-07-17', productType: 'Hot Rolled Steel Coils', quantityTons: 1380, targetTons: 1500, shift: 'Afternoon', machineId: 'MCH-007', efficiency: 92.0, scrapQtyTons: 15 },
  { id: 'PROD-104', date: '2026-07-18', productType: 'Molten Iron Output', quantityTons: 2400, targetTons: 2500, shift: 'Night', machineId: 'MCH-001', efficiency: 96.0, scrapQtyTons: 25 },
  { id: 'PROD-105', date: '2026-07-19', productType: 'Refined EAF Steel Slabs', quantityTons: 1950, targetTons: 2000, shift: 'Morning', machineId: 'MCH-002', efficiency: 97.5, scrapQtyTons: 18 },
  { id: 'PROD-106', date: '2026-07-20', productType: 'Straightened Steel Bars 25mm', quantityTons: 1280, targetTons: 1300, shift: 'Afternoon', machineId: 'MCH-009', efficiency: 98.4, scrapQtyTons: 6 },
  { id: 'PROD-107', date: '2026-07-21', productType: 'Bundled Rebar Bundles', quantityTons: 1850, targetTons: 1800, shift: 'Morning', machineId: 'MCH-015', efficiency: 102.7, scrapQtyTons: 4 }
];

// Inventory collection seed (Finished Steel Goods)
export const SEED_INVENTORY = [
  { id: 'INV-001', name: 'High-Tensile Rebar 12mm', category: 'Finished Steel', quantity: 2450, unit: 'Tons', max_stock: 3000, unit_price: 680, location: 'Zone H – Warehouse', status: 'in_stock' },
  { id: 'INV-002', name: 'Steel Billets 150x150mm', category: 'Semi-Finished Billets', quantity: 4120, unit: 'Tons', max_stock: 5000, unit_price: 590, location: 'Zone D – Continuous Casting', status: 'in_stock' },
  { id: 'INV-003', name: 'Hot Rolled Steel Coils (2.5mm)', category: 'Coils & Sheets', quantity: 1890, unit: 'Tons', max_stock: 2500, unit_price: 740, location: 'Zone E – Rolling Mill', status: 'in_stock' },
  { id: 'INV-004', name: 'Structural Steel I-Beams 300', category: 'Structural Steel', quantity: 480, unit: 'Tons', max_stock: 2000, unit_price: 820, location: 'Zone H – Warehouse', status: 'low_stock' },
  { id: 'INV-005', name: 'Cold Rolled Steel Sheets', category: 'Coils & Sheets', quantity: 1320, unit: 'Tons', max_stock: 2000, unit_price: 790, location: 'Zone F – Heat Treatment', status: 'in_stock' },
  { id: 'INV-006', name: 'Steel Wire Rod Coils 5.5mm', category: 'Wire Rods', quantity: 950, unit: 'Tons', max_stock: 1500, unit_price: 710, location: 'Zone H – Warehouse', status: 'in_stock' }
];

// Raw Materials collection seed
export const SEED_RAW_MATERIALS = [
  { id: 'RAW-001', name: 'Iron Ore Pellets (65% Fe)', category: 'Ore & Minerals', quantity: 18500, unit: 'Tons', max_stock: 25000, unit_price: 115, supplier: 'Vale Global Supply', status: 'in_stock' },
  { id: 'RAW-002', name: 'Heavy Melting Steel Scrap (HMS 1)', category: 'Recycled Steel Scrap', quantity: 9200, unit: 'Tons', max_stock: 15000, unit_price: 340, supplier: 'National Scrap Recycling', status: 'in_stock' },
  { id: 'RAW-003', name: 'Metallurgical Coking Coal', category: 'Fuel & Carbon', quantity: 6400, unit: 'Tons', max_stock: 10000, unit_price: 280, supplier: 'Queensland Coal Resources', status: 'in_stock' },
  { id: 'RAW-004', name: 'Fluxing Limestone', category: 'Fluxes', quantity: 3100, unit: 'Tons', max_stock: 5000, unit_price: 45, supplier: 'Summit Lime Quarries', status: 'in_stock' },
  { id: 'RAW-005', name: 'Ferro-Silicon Alloy 75%', category: 'Alloys', quantity: 280, unit: 'Tons', max_stock: 1000, unit_price: 1850, supplier: 'Global Alloys Inc', status: 'low_stock' },
  { id: 'RAW-006', name: 'Ferro-Manganese Alloy', category: 'Alloys', quantity: 450, unit: 'Tons', max_stock: 1200, unit_price: 1650, supplier: 'Global Alloys Inc', status: 'in_stock' }
];

// Maintenance collection seed
export const SEED_MAINTENANCE = [
  { id: 'MNT-001', machineId: 'MCH-010', machineName: 'Surface Grinding Machine', type: 'Corrective', Priority: 'High', technician: 'Aisha Al-Mansoor', description: 'Spindle bearing vibration threshold exceeded (4.8 mm/s). Replacing precision bearings.', scheduledDate: '2026-07-20', status: 'In Progress' },
  { id: 'MNT-002', machineId: 'MCH-006', machineName: 'Reheating Furnace', type: 'Preventative', Priority: 'Medium', technician: 'Ethan Hunt', description: 'Refractory lining thermal insulation check and burner nozzle cleaning.', scheduledDate: '2026-07-25', status: 'Scheduled' },
  { id: 'MNT-003', machineId: 'MCH-001', machineName: 'Blast Furnace', type: 'Audit', Priority: 'Critical', technician: 'Siddharth Patel', description: 'Tuyere water cooling jacket ultrasonic thickness test.', scheduledDate: '2026-08-10', status: 'Scheduled' },
  { id: 'MNT-004', machineId: 'MCH-007', machineName: 'Rolling Mill', type: 'Routine', Priority: 'Low', technician: 'Lucas Meyer', description: 'Work roll lubrication renewal and hydraulic pressure calibration.', scheduledDate: '2026-07-16', status: 'Completed' }
];

// Reports collection seed
export const SEED_REPORTS = [
  { id: 'REP-001', name: 'Daily Molten Steel Yield & Chemistry Audit', type: 'Metallurgical', dateCreated: '2026-07-21', status: 'Generated', generatedBy: 'Rajesh Sharma', fileUrl: '#' },
  { id: 'REP-002', name: 'Blast Furnace & EAF Thermal Efficiency Report', type: 'Energy & OEE', dateCreated: '2026-07-20', status: 'Generated', generatedBy: 'Viktor Petrov', fileUrl: '#' },
  { id: 'REP-003', name: 'Rolling Mill Dimensional Accuracy & Defect Analysis', type: 'Quality Control', dateCreated: '2026-07-19', status: 'Generated', generatedBy: 'Alexander Wright', fileUrl: '#' },
  { id: 'REP-004', name: 'Steel Plant Monthly Environmental Emission Ledger', type: 'Safety & Compliance', dateCreated: '2026-07-15', status: 'Generated', generatedBy: 'Tariq Al-Rashid', fileUrl: '#' }
];

// Users collection seed
export const SEED_USERS = [
  {
    id: 'USR-ADMIN-01',
    email: 'admin@smartfactory.com',
    full_name: 'Factory Chief Administrator',
    role: 'admin',
    department: 'Administration',
    is_active: true
  },
  {
    id: 'EMP1001',
    email: 'emp1001@smartfactory.com',
    full_name: 'Rajesh Sharma',
    role: 'worker',
    department: 'Steel Melting',
    zone: 'Zone B – Blast Furnace',
    is_active: true
  }
];

// Seed Chat History for AI Assistant
export const SEED_CHAT_HISTORY = [
  {
    id: 'CHAT-001',
    sender: 'user',
    text: 'What is the current status of the Blast Furnace?',
    timestamp: '2026-07-21 09:30:00'
  },
  {
    id: 'CHAT-002',
    sender: 'ai',
    text: 'Blast Furnace (MCH-001) is currently Running at 1485°C core temperature with 96.5% efficiency under operator Rajesh Sharma in Zone B.',
    timestamp: '2026-07-21 09:30:02'
  }
];

// Seed Financial Analytics Data
export const SEED_FINANCE = [
  {
    id: 'FIN-2026-07-21',
    date: '2026-07-21',
    period: 'Today',
    totalIncome: 1420000,
    totalExpenses: 890000,
    netProfit: 530000,
    rawMaterialCost: 450000,
    maintenanceCost: 85000,
    electricityCost: 180000,
    salaryCost: 125000,
    transportCost: 50000
  },
  {
    id: 'FIN-2026-07-20',
    date: '2026-07-20',
    period: 'Daily',
    totalIncome: 1380000,
    totalExpenses: 860000,
    netProfit: 520000,
    rawMaterialCost: 430000,
    maintenanceCost: 90000,
    electricityCost: 175000,
    salaryCost: 120000,
    transportCost: 45000
  },
  {
    id: 'FIN-2026-07-19',
    date: '2026-07-19',
    period: 'Daily',
    totalIncome: 1510000,
    totalExpenses: 920000,
    netProfit: 590000,
    rawMaterialCost: 480000,
    maintenanceCost: 75000,
    electricityCost: 190000,
    salaryCost: 125000,
    transportCost: 50000
  },
  {
    id: 'FIN-2026-07-18',
    date: '2026-07-18',
    period: 'Daily',
    totalIncome: 1650000,
    totalExpenses: 990000,
    netProfit: 660000,
    rawMaterialCost: 520000,
    maintenanceCost: 95000,
    electricityCost: 200000,
    salaryCost: 125000,
    transportCost: 50000
  },
  {
    id: 'FIN-2026-07-17',
    date: '2026-07-17',
    period: 'Daily',
    totalIncome: 1290000,
    totalExpenses: 820000,
    netProfit: 470000,
    rawMaterialCost: 410000,
    maintenanceCost: 70000,
    electricityCost: 170000,
    salaryCost: 125000,
    transportCost: 45000
  }
];

// Seed Attendance Collection Data
export const SEED_ATTENDANCE = [
  { id: 'ATT-1001', employeeId: 'EMP1001', name: 'Rajesh Sharma', date: '2026-07-21', status: 'Present', loginTime: '06:00 AM', logoutTime: '02:00 PM', workingHours: 8.0, breakTime: '45 Mins', overtime: 1.5, shift: 'Morning' },
  { id: 'ATT-1002', employeeId: 'EMP1002', name: 'Viktor Petrov', date: '2026-07-21', status: 'Present', loginTime: '06:00 AM', logoutTime: '02:00 PM', workingHours: 8.0, breakTime: '45 Mins', overtime: 0.0, shift: 'Morning' },
  { id: 'ATT-1003', employeeId: 'EMP1003', name: 'Elena Rostova', date: '2026-07-21', status: 'Present', loginTime: '02:00 PM', logoutTime: '10:00 PM', workingHours: 8.0, breakTime: '45 Mins', overtime: 2.0, shift: 'Afternoon' },
  { id: 'ATT-1004', employeeId: 'EMP1004', name: 'Marcus Vance', date: '2026-07-21', status: 'Absent', loginTime: '-', logoutTime: '-', workingHours: 0.0, breakTime: '-', overtime: 0.0, shift: 'Night' },
  { id: 'ATT-1005', employeeId: 'EMP1005', name: 'Dave Miller', date: '2026-07-21', status: 'Present', loginTime: '06:00 AM', logoutTime: '02:00 PM', workingHours: 8.0, breakTime: '45 Mins', overtime: 1.0, shift: 'Morning' }
];
