import client from "./client";
import Storage from "../interfaces/storage";

//region POST   
async function addStorage(data: object): Promise<void> {
    await client.post("/add-storage", data)
}
//endregion
//region GET
async function allStorages(): Promise<Storage[]>  {
    const res = await client.get<Storage[]>(`/storage`)
    return res.data
}

async function storageById(storage_id: string): Promise<Storage> {
    const res = await client.get<Storage>(`/storage/${storage_id}`)
    return res.data
}

async function storagesByCollectionID(collection_id: string): Promise<Storage[]> {
    const res = await client.get<Storage[]>(`/storage/by-collection/${collection_id}`)
    return res.data
}

async function storageRouteInfo(storage_id: string): Promise<any> {
    const res = await client.get(`/storage/${storage_id}/info`)
    return res.data
}
// Cards by Collection

// cards by Entity

//endregion
//region PUT
async function updateStorage(storage_id: string, name: string): Promise<Storage> {
    const res = await client.put<Storage>(`/storage/${storage_id}`, { new_name: name })
    return res.data
}

//endregion
//region DELETE
async function deleteStorageById(storage_id:number): Promise<Storage> {
    const res = await client.delete(`/storage/${storage_id}`)
    return res.data
}
//endregion


export{
    allStorages,
    storageById,
    storagesByCollectionID,
    storageRouteInfo,
    addStorage,
    updateStorage,
    deleteStorageById,
}