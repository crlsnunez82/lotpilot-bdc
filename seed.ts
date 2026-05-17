import {
  AIDecisionUrgency,
  AIDraftIntent,
  AgentAutomationMode,
  AutoResponseMode,
  AutomationStatus,
  CaptureAction,
  ConversationChannel,
  DedupeStrategy,
  LanguageCode,
  LeadStage,
  LeadStatus,
  MessageDirection,
  MessageStatus,
  OwnershipState,
  PersonalizationSignalType,
  ProspectListType,
  ReplyClassification,
  SourceSystem,
  TaskStatus,
  TaskType,
  WorkflowJobStatus,
  WorkflowJobType,
  WorkflowMode
} from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

function validateSeedAdminPassword(password: string) {
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters for launch-safe setup.");
  }
}

async function main() {
  await db.authAuditEvent.deleteMany();
  await db.loginThrottle.deleteMany();
  await db.agentFeedbackEvent.deleteMany();
  await db.agentLearningProfile.deleteMany();
  await db.agentCommand.deleteMany();
  await db.smartFilter.deleteMany();
  await db.agentProfile.deleteMany();
  await db.agentDecision.deleteMany();
  await db.workflowJobLog.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.captureAudit.deleteMany();
  await db.leadSource.deleteMany();
  await db.task.deleteMany();
  await db.appointment.deleteMany();
  await db.lead.deleteMany();
  await db.person.deleteMany();
  await db.user.deleteMany();

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || "admin@lotpilot.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim() || "change-me-now";
  validateSeedAdminPassword(adminPassword);
  const passwordHash = await hashPassword(adminPassword);

  const user = await db.user.create({
    data: {
      email: adminEmail,
      name: "LotPilot Admin",
      passwordHash
    }
  });

  const agentProfile = await db.agentProfile.create({
    data: {
      agentName: "Mia",
      assistantLabel: "LotPilot BDC Agent",
      agentPersona: "Helpful, concise dealership BDC assistant",
      defaultLanguage: LanguageCode.EN,
      supportedLanguages: [LanguageCode.EN, LanguageCode.ES],
      workDays: [1, 2, 3, 4, 5, 6],
      workHoursStart: "08:30",
      workHoursEnd: "18:00",
      storeHoursStart: "08:00",
      storeHoursEnd: "20:00",
      contactWindowStart: "09:00",
      contactWindowEnd: "19:00",
      timezone: "America/New_York",
      automationMode: AgentAutomationMode.SUGGEST_ONLY,
      autoResponseMode: AutoResponseMode.SUGGEST_ONLY,
      allowSafeAutoSms: true,
      allowSafeAutoEmail: false,
      allowSafeAutoNewLeads: true,
      allowSafeAutoAppointments: true,
      allowSafeAutoMissedRescue: true,
      allowSafeAutoService: false,
      allowSafeAutoMining: false
    }
  });

  await db.agentLearningProfile.create({
    data: {
      agentProfileId: agentProfile.id,
      tonePreference: "friendly_direct",
      directnessScore: 0.62,
      brevityScore: 0.58,
      spanishPreferenceScore: 0.35,
      appointmentAskStyle: "direct",
      serviceMessageStyle: "consultative",
      miningMessageStyle: "reactivation_light",
      adaptationSummary: "Starts neutral and learns from edits, command habits, and workflow controls."
    }
  });


await db.smartFilter.createMany({
  data: [
    {
      agentProfileId: agentProfile.id,
      key: "high-apr-prospects",
      name: "High APR",
      description: "Prospects with payment and APR friction.",
      commandText: "generate high APR prospects",
      listType: ProspectListType.HIGH_APR,
      sourceSystems: [SourceSystem.VINSOLUTIONS, SourceSystem.AUTOMOTIVE_MASTERMIND],
      workflowModes: [WorkflowMode.NEW_LEAD, WorkflowMode.APPOINTMENT_ACTIVE],
      sortOrder: 0
    },
    {
      agentProfileId: agentProfile.id,
      key: "high-mileage-lease",
      name: "High mileage lease",
      description: "Lease upgrade prospects weighted toward Mastermind context.",
      commandText: "show high mileage lease prospects",
      listType: ProspectListType.HIGH_MILEAGE_LEASE,
      sourceSystems: [SourceSystem.AUTOMOTIVE_MASTERMIND],
      workflowModes: [WorkflowMode.MINING_REACTIVATION],
      sortOrder: 1
    },
    {
      agentProfileId: agentProfile.id,
      key: "lease-maturity",
      name: "Lease maturity",
      description: "Lease-end customers worth a fresh look.",
      commandText: "find lease maturity customers",
      listType: ProspectListType.LEASE_MATURITY,
      sourceSystems: [SourceSystem.AUTOMOTIVE_MASTERMIND],
      workflowModes: [WorkflowMode.MINING_REACTIVATION],
      sortOrder: 2
    },
    {
      agentProfileId: agentProfile.id,
      key: "service-appraisal",
      name: "Service appraisal",
      description: "Service-drive sales opportunities.",
      commandText: "show service customers with appraisal potential",
      listType: ProspectListType.SERVICE_APPRAISAL,
      sourceSystems: [SourceSystem.AFFINITIV],
      workflowModes: [WorkflowMode.SERVICE_WHILE_HERE, WorkflowMode.SERVICE_APPOINTMENT_FIRST],
      sortOrder: 3
    },
    {
      agentProfileId: agentProfile.id,
      key: "payment-pain",
      name: "Payment pain",
      description: "Customers showing payment stress or numbers pressure.",
      commandText: "show payment-pain opportunities",
      listType: ProspectListType.PAYMENT_PAIN,
      sourceSystems: [SourceSystem.VINSOLUTIONS],
      workflowModes: [WorkflowMode.NEW_LEAD, WorkflowMode.APPOINTMENT_ACTIVE],
      sortOrder: 4
    },
    {
      agentProfileId: agentProfile.id,
      key: "missed-rescues-today",
      name: "Missed rescues",
      description: "Today’s appointment rescue work.",
      commandText: "show missed appointment rescues today",
      listType: ProspectListType.MISSED_RESCUES,
      sourceSystems: [SourceSystem.VINSOLUTIONS],
      workflowModes: [WorkflowMode.MISSED_RESCUE],
      sortOrder: 5
    },
    {
      agentProfileId: agentProfile.id,
      key: "hot-replies",
      name: "Hot replies",
      description: "Unread inbound activity needing a rep now.",
      commandText: "show hot replies needing me now",
      listType: ProspectListType.HOT_REPLIES,
      sourceSystems: [SourceSystem.VINSOLUTIONS, SourceSystem.AUTOMOTIVE_MASTERMIND, SourceSystem.AFFINITIV],
      workflowModes: [
        WorkflowMode.NEW_LEAD,
        WorkflowMode.APPOINTMENT_ACTIVE,
        WorkflowMode.SERVICE_WHILE_HERE,
        WorkflowMode.SERVICE_APPOINTMENT_FIRST,
        WorkflowMode.MINING_REACTIVATION,
        WorkflowMode.MISSED_RESCUE,
        WorkflowMode.HUMAN_HANDOFF
      ],
      sortOrder: 6
    }
  ]
});


  const jamie = await db.person.create({
    data: {
      firstName: "Jamie",
      lastName: "Carter",
      fullName: "Jamie Carter",
      email: "jamie@example.com",
      emailNormalized: "jamie@example.com",
      phone: "(813) 555-0199",
      phoneNormalized: "8135550199",
      city: "Tampa",
      state: "FL",
      postalCode: "33602",
      preferredLanguage: LanguageCode.EN
    }
  });

  const lead = await db.lead.create({
    data: {
      personId: jamie.id,
      ownerUserId: user.id,
      sourceSystem: SourceSystem.VINSOLUTIONS,
      sourceName: "VinSolutions",
      stage: LeadStage.TENTATIVE,
      ownershipState: OwnershipState.AI_OWNED,
      status: LeadStatus.ACTIVE,
      preferredLanguage: LanguageCode.EN,
      workflowMode: WorkflowMode.APPOINTMENT_ACTIVE,
      workflowModeReason: "Seeded appointment-active retail lead.",
      vehicleInterest: "2024 Toyota RAV4",
      notes: "Seeded lead for local workflow testing. Payment pain and APR conversation started.",
      automationStatus: AutomationStatus.ACTIVE,
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 30)
    }
  });

  await db.leadSource.createMany({
    data: [
      {
        leadId: lead.id,
        personId: jamie.id,
        sourceSystem: SourceSystem.VINSOLUTIONS,
        sourceName: "VinSolutions",
        sourceRecordId: "vs_seed_001",
        sourceCustomerId: "cust_seed_001",
        sourceUrl: "https://dealer.example/vinsolutions/leads/vs_seed_001",
        rawPayload: { source: "seed" },
        normalizedPayload: { seed: true }
      },
      {
        leadId: lead.id,
        personId: jamie.id,
        sourceSystem: SourceSystem.AUTOMOTIVE_MASTERMIND,
        sourceName: "Automotive Mastermind",
        sourceRecordId: "amm_seed_001",
        sourceCustomerId: "prospect_009",
        rawPayload: { campaign: "reactivation" },
        normalizedPayload: { workflowHint: "MINING_REACTIVATION" }
      }
    ]
  });

  await db.captureAudit.create({
    data: {
      leadId: lead.id,
      personId: jamie.id,
      sourceSystem: SourceSystem.VINSOLUTIONS,
      sourceName: "VinSolutions",
      sourceRecordId: "vs_seed_001",
      action: CaptureAction.CREATED,
      dedupeStrategy: DedupeStrategy.NONE,
      requestId: "seed_capture_001",
      payload: { source: "seed" },
      normalizedPayload: { seed: true },
      resultSummary: { createdLeadId: lead.id }
    }
  });

  const appointment = await db.appointment.create({
    data: {
      leadId: lead.id,
      personId: jamie.id,
      ownerUserId: user.id,
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 22),
      status: "scheduled",
      location: "Showroom"
    }
  });

  const smsConversation = await db.conversation.create({
    data: {
      leadId: lead.id,
      personId: jamie.id,
      channel: ConversationChannel.SMS,
      provider: "twilio",
      subject: "SMS conversation",
      contactPhone: jamie.phone,
      contactPhoneNormalized: jamie.phoneNormalized,
      providerPhone: "+18135550100",
      providerPhoneNormalized: "8135550100",
      unreadCount: 1,
      lastMessageAt: new Date(),
      lastMessagePreview: "Yes, I can come in tomorrow afternoon."
    }
  });

  const emailConversation = await db.conversation.create({
    data: {
      leadId: lead.id,
      personId: jamie.id,
      channel: ConversationChannel.EMAIL,
      provider: "smtp",
      subject: "RAV4 follow-up",
      contactEmail: jamie.email,
      contactEmailNormalized: jamie.emailNormalized,
      providerEmail: "LotPilot <noreply@lotpilot.local>",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 90),
      lastMessagePreview: "Thanks for your interest in the RAV4."
    }
  });

  const inboundMessage = await db.message.create({
    data: {
      conversationId: smsConversation.id,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.RECEIVED,
      body: "Yes, I can come in tomorrow afternoon. Habla español tambien?",
      provider: "twilio",
      externalId: "SM_seed_001",
      fromPhone: jamie.phone,
      toPhone: "+18135550100",
      language: LanguageCode.ES,
      receivedAt: new Date()
    }
  });

  await db.message.create({
    data: {
      conversationId: smsConversation.id,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.SENT,
      body: "Perfect — I can help you set that up. What time tomorrow works best?",
      provider: "twilio",
      externalId: "SM_seed_002",
      fromPhone: "+18135550100",
      toPhone: jamie.phone,
      language: LanguageCode.EN,
      draftSource: "manual",
      sentAt: new Date(Date.now() - 1000 * 60 * 10)
    }
  });

  await db.message.create({
    data: {
      conversationId: emailConversation.id,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.QUEUED,
      subject: "RAV4 availability",
      body: "I wanted to keep your RAV4 options moving and answer any pricing questions.",
      provider: "smtp",
      externalId: "email_seed_001",
      fromEmail: "LotPilot <noreply@lotpilot.local>",
      toEmail: jamie.email,
      language: LanguageCode.EN,
      draftSource: "manual",
      sentAt: new Date(Date.now() - 1000 * 60 * 90)
    }
  });

  const task = await db.task.create({
    data: {
      leadId: lead.id,
      personId: jamie.id,
      title: "Review appointment-ready reply",
      description: "Customer replied positively and may prefer Spanish-first handling.",
      type: TaskType.URGENT_REPLY,
      priority: "high",
      source: "workflow",
      status: TaskStatus.OPEN,
      dueAt: new Date(Date.now() + 1000 * 60 * 15),
      createdByUserId: user.id,
      assignedUserId: user.id
    }
  });

  await db.agentDecision.create({
    data: {
      leadId: lead.id,
      conversationId: smsConversation.id,
      messageId: inboundMessage.id,
      decidedByUserId: user.id,
      decisionType: "INBOUND_REPLY_ANALYSIS",
      rationale: "Inbound reply is positive, appointment-ready, and includes a Spanish-language cue.",
      provider: "heuristic",
      classification: ReplyClassification.APPOINTMENT_READY,
      confidenceScore: 0.88,
      draftIntent: AIDraftIntent.FIRM_UP_APPOINTMENT,
      appointmentStageRecommendation: LeadStage.TENTATIVE,
      ownershipRecommendation: OwnershipState.REP_OWNED,
      urgency: AIDecisionUrgency.HIGH,
      channelRecommendation: ConversationChannel.SMS,
      suggestedDelayMinutes: 5,
      handoffRecommended: false,
      payload: {
        draftText: "¡Perfecto Jamie! Puedo apartar tiempo para ti mañana. ¿Qué hora te funciona mejor?",
        summary: "Spanish-first appointment firm-up suggested."
      }
    }
  });

  await db.workflowJobLog.createMany({
    data: [
      {
        queueName: "workflow-automation",
        jobId: "seed_followup",
        leadId: lead.id,
        appointmentId: appointment.id,
        conversationId: smsConversation.id,
        taskId: task.id,
        jobType: WorkflowJobType.CONFIRMATION_REMINDER,
        status: WorkflowJobStatus.SCHEDULED,
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 2),
        payload: { note: "Seed reminder" }
      },
      {
        queueName: "workflow-automation",
        jobId: "seed_service",
        leadId: lead.id,
        conversationId: emailConversation.id,
        jobType: WorkflowJobType.MINING_REACTIVATION,
        status: WorkflowJobStatus.COMPLETED,
        scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 8),
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
        payload: { note: "Seed mining review" }
      }
    ]
  });

  await db.agentCommand.create({
    data: {
      agentProfileId: (await db.agentProfile.findFirstOrThrow()).id,
      leadId: lead.id,
      actorUserId: user.id,
      commandText: "show hot replies needing me now",
      commandKey: "hot-replies",
      resultSummary: { total: 1, leadIds: [lead.id] }
    }
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
