
-- Fix permissive INSERT policy on conversation_participants
DROP POLICY "Users can add participants" ON public.conversation_participants;

CREATE POLICY "Users can add participants to own conversations" ON public.conversation_participants
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND created_by = auth.uid()
    )
    OR auth.uid() = user_id
  );
