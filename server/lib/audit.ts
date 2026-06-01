import type { Request } from 'express';
import { insertRow } from './db.js';

export async function audit(req: Request, action: string, entityType: string, entityId: string, before?: any, after?: any) {
  try {
    await insertRow('audit_logs', {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actor_id: req.user?.id || null,
      actor_email: req.user?.email || null,
      actor_role: req.user?.role || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: req.ip,
      user_agent: req.get('user-agent') || '',
      before_state: before || null,
      after_state: after || null,
    });
  } catch (error) {
    console.error('[AUDIT] Failed to write audit log:', error);
  }
}
