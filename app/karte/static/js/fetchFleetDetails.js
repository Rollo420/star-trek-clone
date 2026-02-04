document.addEventListener('sectorChanged', function(e){
    const sectorID = e.detail.sectorID;
    updateFleetDetails(sectorID);
})

async function updateFleetDetails(id) {
    const container = document.getElementById('fleet-info');

    try
    {
        //fetch fleet infos from django backend 
        // const response = await fetch(`/api/fleet-info/${id}/`);
    }
    catch (error)
    {
        console.error('Fleet-Info Error: ', error);
    }
}