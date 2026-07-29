import client from "./client";
import Storage from "../interfaces/storage";

//region POST   

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
// Cards by Collection

// cards by Entity

//endregion
//region PUT

//endregion
//region DELETE

//endregion


export{
    allStorages,
    storageById,
}