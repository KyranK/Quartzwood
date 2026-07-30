import client from "./client";
import Collection from "../interfaces/collection";

//region POST   

//endregion
//region GET
async function allCollections(): Promise<Collection[]> {
    const res = await client.get<Collection[]>(`/collections/`)
    return res.data
}

async function collectionById(collection_id: number): Promise<Collection> {
    const res = await client.get<Collection>(`/collection/${collection_id}`)
    return res.data
}

async function collectionsByEntityId(entity_id: number): Promise<Collection[]> {
    const res = await client.get<Collection[]>(`/entities/${entity_id}/collections`)
    return res.data
}

// cards by Entity

//endregion
//region PUT

//endregion
//region DELETE

//endregion


export{
    allCollections,
    collectionById,
    collectionsByEntityId, 
}