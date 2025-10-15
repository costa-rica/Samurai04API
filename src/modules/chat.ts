import { Conversation, ContractUserConversation, User } from "samurai04db";

async function getConversationId(
	conversationId: number | null | undefined,
	user: User
): Promise<number> {
	if (!conversationId) {
		const newConversation = await Conversation.create({
			userId: String(user.id),
		});
		await ContractUserConversation.create({
			conversationId: String(newConversation.id),
			userId: String(user.id),
		});
		conversationId = Number(newConversation.id);
	}
	return conversationId;
}

export { getConversationId };
