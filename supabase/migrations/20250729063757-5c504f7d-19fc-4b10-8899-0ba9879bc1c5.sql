-- Update expected_refund for existing claims where it's 0 but should be calculated
UPDATE claims 
SET expected_refund = (
  COALESCE(refunded_work_cost, 0) + 
  COALESCE(refunded_travel_cost, 0) + 
  COALESCE(refunded_vehicle_cost, 0) + 
  COALESCE(refunded_parts_cost, 0) + 
  COALESCE(refunded_other_cost, 0)
)
WHERE expected_refund = 0 
  AND (
    COALESCE(refunded_work_cost, 0) + 
    COALESCE(refunded_travel_cost, 0) + 
    COALESCE(refunded_vehicle_cost, 0) + 
    COALESCE(refunded_parts_cost, 0) + 
    COALESCE(refunded_other_cost, 0)
  ) > 0;