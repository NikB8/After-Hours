
import { PrismaClient, MeetingScope } from '@prisma/client';

const prisma = new PrismaClient();

// Simulated Inngest Event Helper
type MeetingRecordingEvent = {
    data: {
        meetingId: string;
        recordingUrl: string;
    }
};

export const processMeetingRecording = async (event: MeetingRecordingEvent) => {
    const { meetingId } = event.data;

    // 1. Fetch Meeting Details
    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
    });

    if (!meeting) throw new Error(`Meeting ${meetingId} not found`);

    console.log(`[Transcription] Processing Meeting: ${meeting.title} (${meeting.scope})`);

    // 2. Select System Prompt based on Scope
    let systemPrompt = "";
    let focusAreas = "";
    let actionExtraction = "";

    if (meeting.scope === MeetingScope.INTERNAL_CLUSTER || meeting.scope === MeetingScope.INTERNAL_PAN_INDIA) {
        // INTERNAL CONTEXT
        systemPrompt = "You are an Executive Assistant recording minutes for an internal business review.";
        focusAreas = "Focus on Revenue Risks, Churn Alerts, Resource Blockers, and Strategic Decisions.";
        actionExtraction = "Ignore small talk. Capture only assigned tasks with clear owners.";
    } else {
        // EXTERNAL / CLIENT CONTEXT
        systemPrompt = "You are a Client Account Manager recording minutes for a client meeting.";
        focusAreas = "Focus on Client Complaints, New Requests, SLA Breaches, and Satisfaction Signals.";
        actionExtraction = "Capture all client requests and action items assigned to the account team.";
    }

    // 3. (Mock) Call LLM
    const finalPrompt = `
        ${systemPrompt}
        
        INSTRUCTIONS:
        ${focusAreas}
        ${actionExtraction}
        
        TRANSCRIPT:
        (Mock Transcript Content from ${event.data.recordingUrl})
    `;

    console.log("--- GENERATED PROMPT ---");
    console.log(finalPrompt);
    console.log("------------------------");

    // 4. (Mock) Save Minutes
    await prisma.meetingMinutes.create({
        data: {
            meetingId: meeting.id,
            summary: "Generated Summary...",
            transcript: "Raw transcript..."
        }
    });

    return { success: true, promptUsed: systemPrompt };
};
