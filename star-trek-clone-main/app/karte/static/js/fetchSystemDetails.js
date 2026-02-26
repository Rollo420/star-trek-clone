document.addEventListener('sectorChanged', function (e) {
    const sectorID = e.detail.sectorID;
  updateSystemDetails(sectorID);
})

async function updateSystemDetails(id) {
    const container = document.getElementById('system-info');

    try {
        //fetch system infos from django backend 
    }
    catch (error) {
        console.error('System-Info Error: ', error);
    }
}