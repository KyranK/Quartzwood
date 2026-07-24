import client from "./client";

//region POST   
async function refresh_card_image(id: number | null): Promise<void> {
    await client.delete(`/api/card/${id}/refresh-scryfall`)
}
//endregion
//region GET

//endregion
//region PUT

//endregion
//region DELETE

//endregion


export{
   refresh_card_image, 
}

