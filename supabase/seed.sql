-- =============================================================
-- Hunter Demo: Seed Data
-- =============================================================
-- Run this AFTER 0001_initial_schema.sql
-- Loads three realistic Huntersville extrusion lines, a starter
-- log feed, and a maintenance knowledge base for Hunter to query.
-- =============================================================

-- =============================================================
-- MACHINES: three Huntersville extrusion lines
-- =============================================================
insert into machines (id, name, product, current_project, status,
  extrusion_temp_c, line_speed_mpm, conductor_diameter_mm, insulation_thickness_mm,
  baseline_temp_c, baseline_speed_mpm, notes) values

('line-1',
  'Line 1, 230kV Underground',
  '230kV XLPE-insulated underground transmission cable',
  'Utility grid retrofit, Mid-Atlantic',
  'running',
  185.4, 4.6, 38.2, 18.5,
  185.0, 4.5,
  'Standard production run. No alarms in last 24 hours.'),

('line-2',
  'Line 2, 345kV Underground',
  '345kV XLPE-insulated underground transmission cable',
  'Champlain Hudson Power Express',
  'running',
  196.0, 3.6, 45.6, 22.0,
  192.0, 3.8,
  'Line speed has drifted below baseline (3.6 vs 3.8 mpm) over the last 90 minutes. Cooling loop pressure stable, no anomaly yet, but worth watching ahead of the next Champlain Hudson segment.'),

('line-3',
  'Line 3, 400kV Underground',
  '400kV extra high voltage underground transmission cable',
  'Vineyard Wind 1, onshore HV cable',
  'alarm',
  198.5, 3.2, 52.4, 26.8,
  198.0, 4.5,
  'Speed deviation detected. Anomaly active. See log feed and Hunter for context.');

-- =============================================================
-- KNOWLEDGE BASE: troubleshooting and maintenance docs
-- These are fictional but plausible. Hunter will cite them.
-- =============================================================
insert into knowledge_base (doc_id, title, category, applies_to, content, keywords) values

('KB-001',
  'Speed Deviation on Extrusion Lines: Causes and First Response',
  'troubleshooting',
  array['line-1', 'line-2', 'line-3'],
  E'When extrusion line speed drops below 80 percent of baseline for more than 30 seconds, the most common causes are:\n\n1. Material feed inconsistency: pellet hopper level low or moisture exceeding 0.05 percent.\n2. Cooling water flow drop: check cooling loop pump CL-PUMP-02 and inlet pressure.\n3. Conductor tension fluctuation: payoff stand brake adjustment may be drifting.\n4. Crosshead pressure imbalance: indicates die wear or material viscosity change.\n\nFirst response sequence: (a) check pellet hopper and material moisture, (b) verify cooling loop pressure within 4.2 to 4.8 bar, (c) check payoff tension reading on operator HMI. If all three are nominal, escalate to maintenance shift lead.\n\nDO NOT attempt to manually override speed control. The control system is designed to slow the line as a protective response. Forcing speed up risks crosshead damage and a much longer downtime event.',
  array['speed', 'deviation', 'slow', 'extrusion', 'cooling', 'tension']),

('KB-002',
  'Extrusion Temperature Drift: Diagnostic Procedure',
  'troubleshooting',
  array['line-1', 'line-2', 'line-3'],
  E'Extrusion zone temperature should hold within plus or minus 2 degrees Celsius of the recipe setpoint for the cable type being produced.\n\nFor 230kV product: setpoint 185 C, range 183 to 187 C.\nFor 345kV product: setpoint 192 C, range 190 to 194 C.\nFor 400kV product: setpoint 198 C, range 196 to 200 C.\n\nIf temperature drifts beyond plus or minus 2 C: (1) verify thermocouple TC-01 through TC-04 readings agree to within 1 C, (2) check heater band continuity on the affected zone using the maintenance multimeter, (3) inspect cooling water inlet temperature.\n\nA persistent 3 degree drift on a single zone is most often a failing heater band (mean time to failure approximately 18 months under continuous service). Replace at next scheduled stop.',
  array['temperature', 'temp', 'heat', 'drift', 'thermocouple', 'heater', 'band']),

('KB-003',
  'Material Handling Alerts: Pellet Moisture and Feed Issues',
  'troubleshooting',
  array['line-1', 'line-2', 'line-3'],
  E'XLPE pellet moisture content above 0.05 percent will produce visible voids in finished insulation, causing the cable to fail high-pot testing.\n\nWhen the dryer outlet moisture sensor (MOIST-01) trips above 0.05 percent: stop pellet feed to the affected line, switch to backup hopper if available, and engage dryer recovery mode (cycle time approximately 90 minutes).\n\nNever resume production until two consecutive 5-minute moisture readings are below 0.04 percent.\n\nFor Vineyard Wind and Champlain Hudson product, the moisture tolerance is tightened to 0.03 percent per customer specification. Production must pause if any reading exceeds 0.03 for these batches.',
  array['material', 'pellet', 'moisture', 'feed', 'hopper', 'dryer', 'xlpe']),

('KB-004',
  'High-Pot Testing: Procedure and Failure Investigation',
  'quality',
  array['line-1', 'line-2', 'line-3'],
  E'High-pot (high potential) testing applies a DC voltage equal to 2.5 times the cable rated voltage for 15 minutes. The cable must hold voltage with no breakdown.\n\nTest voltages by product: 230kV cable tested at 575kV DC, 345kV cable tested at 862kV DC, 400kV cable tested at 1000kV DC.\n\nA high-pot failure means there is a defect somewhere in the cable run. Most common causes in order of frequency: (1) moisture inclusion (see KB-003), (2) conductor surface damage during stranding, (3) extrusion temperature excursion creating a thermal stress point, (4) contamination in the cleanroom feed.\n\nWhen high-pot fails: do NOT discard the run. Log the failure event with full sensor history. The engineering team uses these for root cause analysis. The defect location can usually be pinpointed within 50 meters using time-domain reflectometry.',
  array['high pot', 'highpot', 'testing', 'quality', 'failure', 'breakdown', 'tdr']),

('KB-005',
  'Cooling Loop Maintenance: Pumps and Pressure',
  'maintenance',
  array['line-1', 'line-2', 'line-3'],
  E'Each extrusion line runs a closed-loop water cooling system. Operating pressure should hold between 4.2 and 4.8 bar at the crosshead inlet.\n\nKey components: CL-PUMP-01 (primary), CL-PUMP-02 (backup, auto-failover), CL-FILTER-01 (replace at 5000 hours or pressure differential above 0.4 bar), CL-HEX-01 (heat exchanger, descale annually).\n\nIf inlet pressure drops below 4.0 bar: the line will throttle speed as a protective response. This is normal and intentional. Do not bypass.\n\nWhen the primary pump trips, the failover engages within 8 seconds. If you see momentary speed dip followed by recovery, that is the failover working correctly. Log the event and schedule pump inspection.',
  array['cooling', 'pump', 'pressure', 'water', 'failover', 'filter']),

('KB-006',
  '400kV Production: Quality Critical Points',
  'quality',
  array['line-3'],
  E'400kV extra high voltage cable is the most demanding product run at Huntersville. Tolerances are tighter than 230kV or 345kV product across the board.\n\nLine speed must hold within plus or minus 2 percent of the recipe value. A 5 percent deviation triggers a quality investigation and likely scrap of the affected segment.\n\nFor Vineyard Wind 1 product specifically: insulation thickness measured at four points around the circumference must agree to within 0.3 mm. Any greater variance flags the segment for additional review before shipment.\n\nThe 430-foot extrusion tower allows the insulation to cool concentrically as the cable descends. Sudden speed changes break that concentricity. Always change speed in steps of less than 0.1 mpm per second.',
  array['400kv', 'extra high voltage', 'vineyard wind', 'quality', 'concentric', 'tower']),

('KB-007',
  'Operator Safety: Approach to Active Lines',
  'safety',
  array['line-1', 'line-2', 'line-3'],
  E'NEVER approach an active extrusion line without proper PPE: hard hat, safety glasses, hearing protection, and FR-rated coveralls.\n\nThe extrusion crosshead operates at 200 C or higher. Skin contact will cause immediate severe burns. Use the long-handled inspection tools when checking material flow.\n\nThe payoff stand can release stored tension if a strand breaks. Stand clear of the payoff arc at all times when the line is running.\n\nFor any procedure that requires accessing the tower itself, line MUST be stopped, locked out, and verified zero-energy before climbing. No exceptions.',
  array['safety', 'ppe', 'lockout', 'approach', 'tower', 'crosshead']),

('KB-008',
  'Champlain Hudson Order: Production Notes',
  'quality',
  array['line-2'],
  E'Champlain Hudson Power Express order specifics for the 345kV product running on Line 2:\n\n- Customer specification requires moisture below 0.03 percent at all times (tighter than standard).\n- Conductor lay direction documented per length, all length segments shipped with traceability tag.\n- Each 1000 meter segment receives an extended 30-minute high-pot test (vs. standard 15-minute).\n- Customer holds the right to witness production on request, coordinate with quality team if a customer visit is scheduled.\n\nTotal order: approximately 339 miles of cable across multiple shipments. Current batch is on schedule.',
  array['champlain hudson', 'chpe', 'hvdc', '345kv', 'order', 'specification']),

('KB-009',
  'Vineyard Wind Order: Production Notes',
  'quality',
  array['line-3'],
  E'Vineyard Wind 1 order specifics for the 400kV onshore product running on Line 3:\n\n- 32 plus miles of high voltage cable for the onshore portion of the project.\n- Cable will connect to 62 GE turbines providing power to roughly 400,000 households.\n- Site completion targeted for first quarter 2023 (this order shipped on time, listed for historical reference).\n- Quality requirement: all segments must pass extended high-pot, dimensional verification at 50 meter intervals.\n\nWhen a Vineyard Wind segment is on the line, all sensor data is retained at higher resolution for 2 years post-shipment, per project documentation requirements.',
  array['vineyard wind', '400kv', 'offshore', 'onshore', 'order', 'specification']),

('KB-010',
  'Anomaly Severity Levels and Response',
  'troubleshooting',
  array['line-1', 'line-2', 'line-3'],
  E'Anomaly score (0 to 1) drives the response action expected from operators:\n\n- Score below 0.3: informational. Log it, continue normal operation, mention to shift lead at next handover.\n- Score 0.3 to 0.6: investigate. Run the first-response sequence in the relevant KB article (KB-001 for speed, KB-002 for temperature, KB-003 for material).\n- Score 0.6 to 0.85: hold quality, do not ship affected segment until quality team reviews. Notify maintenance.\n- Score above 0.85: stop the line. Lock out per safety procedure (KB-007). Notify shift lead and maintenance lead immediately.\n\nWhen in doubt, escalate. A 30-minute hold for review costs far less than a failed customer high-pot test downstream.',
  array['anomaly', 'severity', 'response', 'escalation', 'score']);

-- =============================================================
-- LOGS: starter log feed (last 30 entries)
-- These appear on the dashboard when the demo first loads
-- =============================================================
insert into logs (machine_id, ts, severity, message, is_anomaly, anomaly_type, anomaly_score, sensor_snapshot) values

-- Line 1: clean running, mostly nominal
('line-1', now() - interval '15 minutes', 'info', 'Line 1 batch start, 230kV underground production', false, null, null, '{"temp_c":185.2,"speed_mpm":4.5}'),
('line-1', now() - interval '13 minutes', 'info', 'Temperature stable at 185.2 C, nominal range', false, null, null, '{"temp_c":185.2,"speed_mpm":4.5}'),
('line-1', now() - interval '11 minutes', 'info', 'Cooling loop pressure 4.5 bar, nominal', false, null, null, '{"cooling_bar":4.5}'),
('line-1', now() - interval '9 minutes', 'info', 'Crosshead pressure within tolerance', false, null, null, null),
('line-1', now() - interval '6 minutes', 'info', 'Quality check passed: dimensional verification segment 1', false, null, null, null),
('line-1', now() - interval '3 minutes', 'info', 'Line speed 4.6 mpm, nominal', false, null, null, '{"speed_mpm":4.6}'),
('line-1', now() - interval '1 minute', 'info', 'Temperature 185.4 C, all sensors agree to within 0.5 C', false, null, null, '{"temp_c":185.4}'),

-- Line 2: Champlain Hudson, running well, brief moisture flag earlier
('line-2', now() - interval '17 minutes', 'info', 'Line 2 batch start, Champlain Hudson 345kV product', false, null, null, '{"temp_c":192.0,"speed_mpm":3.8}'),
('line-2', now() - interval '15 minutes', 'warning', 'Pellet moisture reading 0.04 percent, within tolerance but elevated', false, null, null, '{"moisture":0.04}'),
('line-2', now() - interval '14 minutes', 'info', 'Pellet moisture returned to 0.025 percent', false, null, null, '{"moisture":0.025}'),
('line-2', now() - interval '12 minutes', 'info', 'Temperature stable at 192.1 C', false, null, null, '{"temp_c":192.1}'),
('line-2', now() - interval '10 minutes', 'info', 'High-pot pre-test routine started for segment 4', false, null, null, null),
('line-2', now() - interval '8 minutes', 'info', 'High-pot pre-test passed at 862kV DC', false, null, null, null),
('line-2', now() - interval '5 minutes', 'info', 'Segment 4 ready for shipment', false, null, null, null),
('line-2', now() - interval '2 minutes', 'info', 'Line speed 3.8 mpm, nominal', false, null, null, '{"speed_mpm":3.8}'),

-- Line 3: Vineyard Wind 400kV. Speed anomaly developing.
('line-3', now() - interval '20 minutes', 'info', 'Line 3 batch start, Vineyard Wind 1 retrospective production run for spares', false, null, null, '{"temp_c":198.0,"speed_mpm":4.5}'),
('line-3', now() - interval '18 minutes', 'info', 'Temperature 198.0 C, in tolerance for 400kV product', false, null, null, '{"temp_c":198.0}'),
('line-3', now() - interval '15 minutes', 'info', 'Concentricity check passed at segment 1', false, null, null, null),
('line-3', now() - interval '12 minutes', 'info', 'Line speed 4.5 mpm, nominal', false, null, null, '{"speed_mpm":4.5}'),
('line-3', now() - interval '8 minutes', 'warning', 'Cooling loop pressure dropped to 4.3 bar (low end of nominal)', false, null, null, '{"cooling_bar":4.3}'),
('line-3', now() - interval '6 minutes', 'warning', 'Line speed reduced to 4.1 mpm, possible throttle response to cooling', false, null, null, '{"speed_mpm":4.1,"cooling_bar":4.2}'),
('line-3', now() - interval '4 minutes', 'warning', 'Line speed at 3.6 mpm, 20 percent below baseline 4.5 mpm', false, null, null, '{"speed_mpm":3.6}'),
('line-3', now() - interval '2 minutes', 'anomaly', 'ANOMALY: Line speed dropped to 3.2 mpm, 28 percent below baseline 4.5 mpm. Possible cooling-related throttle.', true, 'speed_deviation', 0.72, '{"speed_mpm":3.2,"cooling_bar":4.1,"temp_c":198.5}'),
('line-3', now() - interval '90 seconds', 'warning', 'Cooling loop pressure 4.1 bar, low end of range', false, null, null, '{"cooling_bar":4.1}'),
('line-3', now() - interval '45 seconds', 'anomaly', 'ANOMALY HOLD: Quality flag raised. Awaiting operator response.', true, 'speed_deviation', 0.78, '{"speed_mpm":3.2,"cooling_bar":4.1}');

-- =============================================================
-- INCIDENT MEMORY: past resolved anomalies on these lines.
-- Hunter uses these so its answers cite the team's actual fixes,
-- not just the manual.
-- =============================================================
insert into incident_memory (occurred_at, machine_id, anomaly_type, symptom, root_cause, fix_applied, fixed_by, resolution_minutes, outcome, notes) values

(now() - interval '14 days', 'line-3', 'speed_deviation',
  'Line 3 speed dropped to 3.4 mpm, 24 percent below baseline; cooling pressure dropped to 4.05 bar.',
  'CL-FILTER-01 differential pressure measured at 0.45 bar, above the 0.4 bar replacement threshold from KB-005.',
  'Filter cartridge replaced; cooling pressure recovered to 4.6 bar within 4 minutes; line ramped to baseline.',
  'Shift lead, shift 2',
  22,
  'resolved',
  'Filter had passed 5100 service hours, slightly over the recommended 5000 hour replacement schedule.'),

(now() - interval '8 days', 'line-3', 'speed_deviation',
  'Brief speed dip to 3.9 mpm for about 10 seconds, then auto-recovered to baseline.',
  'CL-PUMP-01 momentary trip; failover to CL-PUMP-02 engaged within 8 seconds as designed in KB-005.',
  'No operator action required. Logged for maintenance pump inspection at next scheduled stop.',
  'Auto-recovered',
  1,
  'resolved',
  'Failover behavior matched documented expectation. CL-PUMP-01 inspected next stop with no faults found.'),

(now() - interval '3 days', 'line-2', 'material_alert',
  'Pellet moisture sensor MOIST-01 tripped at 0.052 percent, above the 0.05 percent threshold.',
  'Brief ambient humidity spike during early morning shift change.',
  'Engaged dryer recovery mode for 90 minutes per KB-003; verified two consecutive 5 minute readings below 0.04 percent before resuming.',
  'Operator, shift 1',
  92,
  'resolved',
  'Champlain Hudson order on Line 2; tightened 0.03 percent customer spec applied for the resume threshold.'),

(now() - interval '21 days', 'line-3', 'quality_hold',
  '400kV product concentricity variance measured at 0.35 mm at segment 14, above the 0.3 mm Vineyard Wind spec from KB-006.',
  'Tower fan unit TFU-03 was running at 92 percent of nominal RPM, causing uneven cooling on the descent.',
  'Fan unit retorqued; verified RPM within 1 percent of nominal; reran concentricity verification on the next segment with no further variance.',
  'Maintenance lead',
  47,
  'resolved',
  'Caught before any Vineyard Wind segment shipped. Tower fan inspection added to the weekly maintenance schedule.'),

(now() - interval '35 days', 'line-1', 'temp_drift',
  'Extrusion zone 2 temperature drifted 3.2 C above setpoint over 90 minutes despite stable cooling.',
  'Heater band HTR-02 was reading inconsistently; thermocouple TC-02 disagreed with TC-01 by 1.8 C.',
  'Replaced HTR-02 heater band at next scheduled stop; TC-02 recalibrated.',
  'Maintenance, shift 3',
  null,
  'resolved',
  'HTR-02 had 16,800 service hours, within the expected 18 month mean time to failure window from KB-002.'),

(now() - interval '42 days', 'line-3', 'quality_hold',
  'Segment 12 of 400kV cable failed the extended high-pot test at 1000kV DC per KB-004.',
  'Time-domain reflectometry pinpointed the defect at 174 m into the segment; root cause was moisture inclusion from a brief MOIST-01 sensor lag the previous shift.',
  'Segment 12 (118 m) scrapped. Process change: moisture re-check interval tightened from 10 to 5 minutes for the rest of the Vineyard Wind run.',
  'Quality team and shift lead',
  null,
  'recurred',
  'Second moisture-driven high-pot failure on Vineyard Wind product this quarter. Flagged for deeper root cause review.');

-- =============================================================
-- After seed: a count check that the dashboard can show
-- =============================================================
-- select count(*) from machines;          -- expect 3
-- select count(*) from logs;              -- expect ~26
-- select count(*) from knowledge_base;    -- expect 10
-- select count(*) from incident_memory;   -- expect 6
