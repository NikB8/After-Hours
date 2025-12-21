-- CreateIndex
CREATE INDEX "ClubMember_user_id_idx" ON "ClubMember"("user_id");

-- CreateIndex
CREATE INDEX "Participant_user_id_idx" ON "Participant"("user_id");

-- CreateIndex
CREATE INDEX "Recommendation_event_id_idx" ON "Recommendation"("event_id");
