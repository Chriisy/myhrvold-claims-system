-- Create function to calculate supplier scorecards
CREATE OR REPLACE FUNCTION public.calculate_supplier_scorecards()
RETURNS TABLE(
  supplier_name TEXT,
  total_claims INTEGER,
  active_claims INTEGER,
  resolved_claims INTEGER,
  avg_response_time_days NUMERIC,
  total_cost NUMERIC,
  total_refunded NUMERIC,
  refund_rate NUMERIC,
  score NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  WITH supplier_stats AS (
    SELECT 
      c.supplier,
      COUNT(*) as total_claims,
      COUNT(*) FILTER (WHERE c.status IN ('new', 'pending_approval', 'under_processing', 'sent_supplier')) as active_claims,
      COUNT(*) FILTER (WHERE c.status = 'resolved') as resolved_claims,
      AVG(
        CASE 
          WHEN c.supplier_response_date IS NOT NULL AND c.supplier_email_sent_date IS NOT NULL
          THEN EXTRACT(EPOCH FROM (c.supplier_response_date - c.supplier_email_sent_date)) / 86400.0
          ELSE NULL
        END
      ) as avg_response_time_days,
      COALESCE(SUM(c.total_cost), 0) as total_cost,
      COALESCE(SUM(c.total_refunded), 0) as total_refunded
    FROM public.claims c
    WHERE c.supplier IS NOT NULL AND c.supplier != ''
    GROUP BY c.supplier
  ),
  supplier_scores AS (
    SELECT 
      s.*,
      CASE 
        WHEN s.total_claims > 0 THEN (s.total_refunded / NULLIF(s.total_cost, 0)) * 100
        ELSE 0
      END as refund_rate,
      -- Calculate score (higher is better)
      -- Based on: fast response (max 25pts) + high refund rate (max 25pts) + low total cost impact (max 25pts) + claim resolution (max 25pts)
      LEAST(100, 
        COALESCE(
          CASE 
            WHEN s.avg_response_time_days IS NULL THEN 0
            WHEN s.avg_response_time_days <= 1 THEN 25
            WHEN s.avg_response_time_days <= 3 THEN 20
            WHEN s.avg_response_time_days <= 7 THEN 15
            WHEN s.avg_response_time_days <= 14 THEN 10
            ELSE 5
          END, 0
        ) +
        COALESCE(
          CASE 
            WHEN s.total_claims = 0 THEN 0
            WHEN (s.total_refunded / NULLIF(s.total_cost, 0)) >= 0.8 THEN 25
            WHEN (s.total_refunded / NULLIF(s.total_cost, 0)) >= 0.6 THEN 20
            WHEN (s.total_refunded / NULLIF(s.total_cost, 0)) >= 0.4 THEN 15
            WHEN (s.total_refunded / NULLIF(s.total_cost, 0)) >= 0.2 THEN 10
            ELSE 5
          END, 0
        ) +
        COALESCE(
          CASE 
            WHEN s.total_cost <= 10000 THEN 25
            WHEN s.total_cost <= 50000 THEN 20
            WHEN s.total_cost <= 100000 THEN 15
            WHEN s.total_cost <= 200000 THEN 10
            ELSE 5
          END, 25
        ) +
        COALESCE(
          CASE 
            WHEN s.total_claims = 0 THEN 0
            WHEN (s.resolved_claims::NUMERIC / s.total_claims) >= 0.8 THEN 25
            WHEN (s.resolved_claims::NUMERIC / s.total_claims) >= 0.6 THEN 20
            WHEN (s.resolved_claims::NUMERIC / s.total_claims) >= 0.4 THEN 15
            WHEN (s.resolved_claims::NUMERIC / s.total_claims) >= 0.2 THEN 10
            ELSE 5
          END, 0
        )
      ) as score
    FROM supplier_stats s
  )
  SELECT 
    ss.supplier as supplier_name,
    ss.total_claims::INTEGER,
    ss.active_claims::INTEGER,
    ss.resolved_claims::INTEGER,
    ROUND(ss.avg_response_time_days, 1) as avg_response_time_days,
    ss.total_cost,
    ss.total_refunded,
    ROUND(ss.refund_rate, 1) as refund_rate,
    ROUND(ss.score, 0) as score
  FROM supplier_scores ss
  ORDER BY ss.score DESC, ss.supplier;
END;
$$;