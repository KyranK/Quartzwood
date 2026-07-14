import client from "./client";
import Card from "../interfaces/card";

//region POST   
async function addCard(data: object): Promise<void> {
    await client.post("/add-cards", data)
}
//endregion
//region GET
async function cardByStorage(storage_name: string): Promise<Card[]> {
    const res = await client.get(`/api/storage/${storage_name}/cards`)
    return res.data
}
//endregion
//region PUT
async function updateCard(id: number, data: Partial<Card>): Promise<void> {
    await client.put(`/card/${id}`, data)
}
//endregion
//region DELETE

//endregion


export{
    addCard,
    cardByStorage,
    updateCard,
}