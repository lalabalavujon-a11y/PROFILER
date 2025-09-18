import axios from "axios";

export async function postSlackBlocks(webhookUrl: string, blocks: any) {
  await axios.post(webhookUrl, { blocks: blocks.blocks });
}
