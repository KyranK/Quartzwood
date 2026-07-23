import client from "./client";
import Card from "../interfaces/card";

//region POST   
async function addCard(data: object): Promise<void> {
    await client.post("/add-cards", data)
}
//endregion
//region GET
async function cardById(card_id: number | null): Promise<Card> {
    const res = await client.get<Card>(`/card/${card_id}`)
    return res.data
}

async function cardsByStorage(storage_id: string): Promise<Card[]> {
    const res = await client.get(`/api/storage/${storage_id}/cards`)
    return res.data
}

// Cards by Collection

// cards by Entity


//endregion
//region PUT
async function updateCard(id: number | null, data: Partial<Card>): Promise<void> {
    await client.put(`/card/${id}`, data)
}
//endregion
//region DELETE
async function deleteCard(id: number): Promise<void> {
    await client.delete(`/card/${id}`)
}
//endregion


export{
    addCard,
    cardById,
    cardsByStorage,
    updateCard,
    deleteCard,
}