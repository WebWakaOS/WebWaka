/**
 * NDPR Article 30 Processing Register — SA-4.3 / M12
 * WebWaka OS — Automated AI processing activity register for NDPR compliance.
 *
 * D1 table: ai_processing_register (migration 0205).
 *
 * The register tracks all AI processing activities as required by NDPR Article 30:
 *   - Purpose of processing
 *   - Categories of data subjects
 *   - Categories of personal data
 *   - Recipients or categories of recipients
 *   - Retention periods
 *   - Technical/organisational security measures
 *
 * Auto-populated from:
 *   - ai_vertical_configs (capability → processing activity mapping)
 *   - superagent_consents (consent status per activity)
 *   - ai_usage_events (actual processing volumes)
 *
 * Platform Invariants:
 *   P10 — NDPR compliance
 *   P13 — No raw PII in register exports
 *   T3  — All queries tenant-scoped
 */

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export interface ProcessingActivity {
  id: string;
  tenantId: string;
  activityName: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string;
  dataSubjects: string;
  recipients: string;
  retentionPeriod: string;
  securityMeasures: string;
  vertical: string;
  capability: string;
  isActive: boolean;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterEntry {
  activityName: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string;
  dataSubjects: string;
  recipients: string;
  retentionPeriod: string;
  securityMeasures: string;
  vertical: string;
  capability: string;
}

export interface NdprRegisterDeps {
  db: D1Like;
}

const CAPABILITY_REGISTER_MAP: Record<string, Omit<RegisterEntry, 'vertical' | 'capability'>> = {
  bio_generator: {
    activityName: 'AI Bio Generation',
    purpose: 'Generate biographical descriptions from profile data for public display',
    legalBasis: 'Consent (NDPR Regulation 2.3)',
    dataCategories: 'Professional profile data, business name, role, location',
    dataSubjects: 'Workspace owners, business operators',
    recipients: 'AI provider (via encrypted API), workspace owner',
    retentionPeriod: 'AI input/output not retained (P13); usage metadata 12 months',
    securityMeasures: 'AES-256 key encryption, BYOK support, PII stripping (P13), TLS 1.3',
  },
  superagent_chat: {
    activityName: 'AI Conversational Assistant',
    purpose: 'Provide AI-powered conversational assistance for workspace operations',
    legalBasis: 'Consent (NDPR Regulation 2.3)',
    dataCategories: 'User-provided text prompts (PII stripped per P13)',
    dataSubjects: 'Workspace members with AI consent',
    recipients: 'AI provider (via encrypted API)',
    retentionPeriod: 'Prompt content not retained (P13); usage metadata 12 months',
    securityMeasures: 'PII stripping, NDPR consent gate, BYOK encryption, TLS 1.3',
  },
  content_moderation: {
    activityName: 'AI Content Moderation',
    purpose: 'Automated safety classification of user-generated content',
    legalBasis: 'Legitimate Interest (platform safety, NDPR Regulation 2.4)',
    dataCategories: 'Post text, comment text (PII stripped)',
    dataSubjects: 'Content authors within workspace communities',
    recipients: 'AI provider (classification only, no content storage)',
    retentionPeriod: 'Moderation flags 6 months; raw content not sent to AI (P13)',
    securityMeasures: 'Automated only (L4 scoped), PII stripped, audit logged',
  },
  translation: {
    activityName: 'AI Language Translation',
    purpose: 'Translate content between English, Pidgin, Hausa, Yoruba, and Igbo',
    legalBasis: 'Consent (NDPR Regulation 2.3)',
    dataCategories: 'Text content for translation (PII stripped)',
    dataSubjects: 'Workspace members requesting translation',
    recipients: 'AI provider (via encrypted API)',
    retentionPeriod: 'Translation content not retained (P13); usage metadata 12 months',
    securityMeasures: 'PII stripping, NDPR consent gate, TLS 1.3',
  },
  embedding: {
    activityName: 'AI Text Embedding',
    purpose: 'Generate vector representations for semantic search and discovery',
    legalBasis: 'Legitimate Interest (search quality, NDPR Regulation 2.4)',
    dataCategories: 'Listing descriptions, profile text (PII stripped)',
    dataSubjects: 'Workspace operators with published content',
    recipients: 'AI provider (embedding computation only)',
    retentionPeriod: 'Embeddings stored as vectors (no PII); usage metadata 12 months',
    securityMeasures: 'PII stripping before embedding, tenant-scoped storage',
  },
  demand_forecasting: {
    activityName: 'AI Demand Forecasting',
    purpose: 'Predict demand patterns from aggregated historical transaction data',
    legalBasis: 'Legitimate Interest (business analytics, NDPR Regulation 2.4)',
    dataCategories: 'Aggregated sales volumes, date ranges (no individual transaction PII)',
    dataSubjects: 'Workspace business operations (aggregated, not individual)',
    recipients: 'AI provider (aggregated data only)',
    retentionPeriod: 'Forecasts retained 3 months; source data aggregated (P13)',
    securityMeasures: 'Data aggregation before AI, no individual PII, tenant-scoped',
  },
  sentiment_analysis: {
    activityName: 'AI Sentiment Analysis',
    purpose: 'Classify sentiment of reviews and feedback for quality improvement',
    legalBasis: 'Legitimate Interest (service quality, NDPR Regulation 2.4)',
    dataCategories: 'Review text, feedback text (PII stripped)',
    dataSubjects: 'Review authors (anonymized before processing)',
    recipients: 'AI provider (classification only)',
    retentionPeriod: 'Sentiment scores retained; source text not stored (P13)',
    securityMeasures: 'Author anonymization, PII stripping, audit logged',
  },
  document_extractor: {
    activityName: 'AI Document Data Extraction',
    purpose: 'Extract structured data from uploaded documents (CAC, INEC, etc.)',
    legalBasis: 'Consent (NDPR Regulation 2.3)',
    dataCategories: 'Document images, PDF text (sensitive fields redacted)',
    dataSubjects: 'Document owners with explicit consent',
    recipients: 'AI provider (via encrypted API, document not stored)',
    retentionPeriod: 'Extracted data retained per document lifecycle; raw images deleted after processing',
    securityMeasures: 'Consent required, sensitive field redaction, TLS 1.3, BYOK support',
  },
};

export class NdprRegister {
  private readonly db: D1Like;

  constructor(deps: NdprRegisterDeps) {
    this.db = deps.db;
  }

  async seedFromVerticalConfigs(
    tenantId: string,
    verticalConfigs: Record<string, { slug: string; allowedCapabilities: readonly string[] }>,
  ): Promise<number> {
    let seeded = 0;

    for (const [, config] of Object.entries(verticalConfigs)) {
      for (const capability of config.allowedCapabilities) {
        const template = CAPABILITY_REGISTER_MAP[capability];
        if (!template) continue;

        const existing = await this.db
          .prepare(
            `SELECT id FROM ai_processing_register
             WHERE tenant_id = ? AND vertical = ? AND capability = ?`,
          )
          .bind(tenantId, config.slug, capability)
          .first<{ id: string }>();

        if (existing) continue;

        const id = crypto.randomUUID();
        await this.db
          .prepare(
            `INSERT INTO ai_processing_register
               (id, tenant_id, activity_name, purpose, legal_basis,
                data_categories, data_subjects, recipients, retention_period,
                security_measures, vertical, capability, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          )
          .bind(
            id, tenantId,
            template.activityName, template.purpose, template.legalBasis,
            template.dataCategories, template.dataSubjects, template.recipients,
            template.retentionPeriod, template.securityMeasures,
            config.slug, capability,
          )
          .run();

        seeded++;
      }
    }

    return seeded;
  }

  async listActivities(tenantId: string, activeOnly = true): Promise<ProcessingActivity[]> {
    let sql = `SELECT id, tenant_id, activity_name, purpose, legal_basis,
                      data_categories, data_subjects, recipients, retention_period,
                      security_measures, vertical, capability, is_active,
                      last_reviewed_at, created_at, updated_at
               FROM ai_processing_register WHERE tenant_id = ?`;
    if (activeOnly) sql += ' AND is_active = 1';
    sql += ' ORDER BY vertical, capability';

    const { results } = await this.db
      .prepare(sql)
      .bind(tenantId)
      .all<{
        id: string; tenant_id: string; activity_name: string; purpose: string;
        legal_basis: string; data_categories: string; data_subjects: string;
        recipients: string; retention_period: string; security_measures: string;
        vertical: string; capability: string; is_active: number;
        last_reviewed_at: string | null; created_at: string; updated_at: string;
      }>();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      activityName: r.activity_name,
      purpose: r.purpose,
      legalBasis: r.legal_basis,
      dataCategories: r.data_categories,
      dataSubjects: r.data_subjects,
      recipients: r.recipients,
      retentionPeriod: r.retention_period,
      securityMeasures: r.security_measures,
      vertical: r.vertical,
      capability: r.capability,
      isActive: r.is_active === 1,
      lastReviewedAt: r.last_reviewed_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async markReviewed(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE ai_processing_register
         SET last_reviewed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(id, tenantId)
      .run();
    return (result.meta?.changes ?? 0) > 0;
  }

  async exportRegister(tenantId: string): Promise<{
    generatedAt: string;
    controller: string;
    activities: ProcessingActivity[];
    totalActivities: number;
    activeActivities: number;
  }> {
    const all = await this.listActivities(tenantId, false);
    const active = all.filter((a) => a.isActive);

    return {
      generatedAt: new Date().toISOString(),
      controller: `Tenant ${tenantId}`,
      activities: all,
      totalActivities: all.length,
      activeActivities: active.length,
    };
  }
}
