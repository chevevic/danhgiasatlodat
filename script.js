async function getweather(lat,lon) {
    try {
    const api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=5ecd55a45b022c71aede9450aaffb59d`;
    const api_url11 =  `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
    const api_url2 =   'https://api.openepi.io/soil/type?' + new URLSearchParams({
        lon: "9.58",
        lat: "60.1",
        top_k: "13"
      });
    const response = await fetch(api_url);
    const json = await response.json();
    console.log(json);
    const enddate = getDates(json.dt).currentDate;
    const startdate = getDates(json.dt).twoDaysAgo;
    const api_url12 = `https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${lat + 0.0008}&longitude=${lon + 0.0008}&start_date=${startdate}&end_date=${enddate}&daily=precipitation_sum&timezone=Asia%2FBangkok`
    const response12 = await fetch(api_url12);
    const hourly = await response12.json();
    console.log(hourly);
    const elevation11 = await fetch(api_url11);;
    const elevationData1 = await elevation11.json();
    const elevation1 = elevationData1.elevation[0];
    const elevation2 = hourly.elevation;
    const distance = getDistance(lat, lon, lat + 0.0008, lon + 0.0008); 
    const slope = Math.atan((Math.abs(elevation2 - elevation1)) / distance)*(180 / Math.PI);
    console.log(`Slope: ${slope} °`);
    const response2 = await fetch(api_url2);
    const soiltype = await response2.json();
    console.log(soiltype);
    const api_url6 = `https://us1.locationiq.com/v1/reverse?key=pk.0d07b084d9adef628f0e7240262d65e6&lat=${lat}&lon=${lon}&format=json&`;
    const response6 = await fetch(api_url6);
    const locationdata = await response6.json();
    console.log(locationdata);
    const url = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&limit=300`;
    const response4 = await fetch(url);
    const seismicData = await response4.json();
    console.log(seismicData);
    let totalImpact = 0;
    let count = 0;
    if (seismicData.features && Array.isArray(seismicData.features)) {
        seismicData.features.forEach(earthquake => {
            const magnitude = earthquake.properties.mag;
            const earthquakeLat = earthquake.geometry.coordinates[1];
            const earthquakeLon = earthquake.geometry.coordinates[0];
            const distance1 = getDistance(lat, lon, earthquakeLat, earthquakeLon);
            const impact = calculateImpact(magnitude,distance1);
            totalImpact += impact;
            count++;
        });
    } else {
        console.error("Dữ liệu động đất không hợp lệ hoặc không có dữ liệu features.");
    }
    const Impact = count > 0 ? totalImpact / count : 0;
    const moistapi = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_moisture_9_to_27cm`
    const response5 = await fetch(moistapi);
    const moistData = await response5.json();
    const moist = moistData.hourly.soil_moisture_9_to_27cm[0];
    return {
        json,
        hourly,
        slope,
        soiltype,
        Impact,
        moist,
        locationdata,
        elevationData1
    };
    } catch (error) {
        console.error("An error occurred:", error);
        return 0;
    }
}
var script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
script.onload = function() {
    console.log('jQuery đã được tải thành công!');
    $('h1').text('jQuery đã được tải xong!');
};
script.onerror = function() {
    console.error('Lỗi khi tải jQuery!');
};
document.head.appendChild(script);
function getHumanData(city) {
    if (city === "") {
        return 0;
    } else {
    try {
     return new Promise((resolve, reject) => {
         const name = city;
         if (name === "") {
            return 0;
         }
         const apiKeys = ['CvVjkVRAMC0qBCc3X00OPA==jL1dpztC8JYWK4Fm','bx1RyMZI6jijYhcOkN09oA==fWblJEURLHBnuQMP','1T+PdTDqdcBAN2KBPy3rUA==Azgxa1tszECyQmdB','jdXat9Ki5HubXgmipMFdAA==WftEvsVIXvufKXUf',]; // Thay 'YOUR_NEW_API_KEY' bằng API key mới của bạn
         let currentApiKeyIndex = 0;
 
         function makeRequest() {
             $.ajax({
                 method: 'GET',
                 url: 'https://api.api-ninjas.com/v1/city?name=' + name,
                 headers: { 'X-Api-Key': apiKeys[currentApiKeyIndex] },
                 contentType: 'application/json',
                 success: function(result) {
                     if (result && result[0] && result[0].population) {
                         console.log(result);
                         resolve(result[0].population);
                     } else {
                         resolve(156474);
                     }
                 },
                 error: function ajaxError(jqXHR) {
                     if (jqXHR.status === 400 && currentApiKeyIndex === 0) {
                         console.log('API key đầu tiên không hợp lệ, thử với key khác...');
                         currentApiKeyIndex++;
                         makeRequest();
                     } else {
                         reject('Error: ' + jqXHR.responseText);
                     }
                 }
             });
         }
 
         makeRequest();
     });
    } catch (error) {
         console.error('Có lỗi trong quá trình thực thi:', error);
         return;
    }
 };}
function calculatehazard(slope,rain,soil,elevation,wind) {
    hazard = ((slope*0.17 + elevation*0.36 + soil*0.055 + rain*0.36 + wind*0.055 )).toFixed(3);
    return hazard
}
function getelevationFactor(elevation) {
    if (elevation < 500) return 1;
    if (elevation >= 500 && elevation < 1000) return 2;
    if (elevation >= 1000 && elevation < 1500) return 3;
    return 4;
}
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
function getslopeFactor(slope) {
    if (slope < 8 ) return 1;
    if (slope >= 8 && slope < 15) return 2;
    if (slope >= 15 && slope < 20) return 3;
    if (slope >= 20 && slope < 25) return 4;
    if (slope >= 25 && slope < 30) return 5;
    return 5;
}
function getNDVIFactor(NDVI) {
    if (NDVI >= 0 && NDVI < 0.15) return 1;
    if (NDVI >= 0.65 && NDVI < 0.9) return 2;
    if (NDVI >= 0.455 && NDVI < 0.65) return 3;
    if (NDVI >= 0.3 && NDVI < 0.45) return 4;
    if (NDVI >= 0.2 && NDVI < 0.3) return 5;
    return 3;
}
function getrainFactor(rainfall) {
    if (rainfall < 9 ) return 1;
    if (rainfall >= 9 && rainfall < 14) return 1;
    if (rainfall >= 14 && rainfall < 20) return 2;
    if (rainfall >= 20 && rainfall < 27) return 2;
    if (rainfall >= 27 && rainfall < 35) return 3;
    if (rainfall >= 35 && rainfall < 42) return 3;
    if (rainfall >= 42 && rainfall < 50) return 4;
    return 4;
}
function getsoilFactor(soil) {
    if (soil === "Fluvisols" || soil === "Gleysols") return 1;
    if (soil === "Histosols" || soil === "Andosols" || soil === "Arenosols" ) return 2;
    if (soil === "Luvisols" || soil === "Ferralsols" || soil ==="Acrisols" || soil ==="vertisols" || soil ==="Lixisols" )  return 3;
    return 3;
}
function getwindFactor(wind) {
    if (wind <= 6) return 1;
    if (wind > 6 && wind < 10) return 1;
    if (wind >= 10 && wind < 16) return 2;
    if (wind >= 16 && wind < 22) return 3;
    if (wind >= 22 && wind <= 30) return 4;
    if (wind > 30 && wind <=42) return 5;
    return 6;
}
function getsoilmoistureFactor(humid) {
if (humid > 25) return ((humid - 25)/(75));
else return ((25 - humid)/(25));
}
function getseismicFactor(seismic) {
    if (seismic < 1) return 0;
    if (seismic >= 1 && seismic < 2) return 0.25;
    if (seismic >= 2 && seismic < 4) return 0.45;
    if (seismic >= 4 && seismic <= 6) return 0.6; 
    return 1;
}
async function getlatlonbycity(city) {
    api = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
    const response = await fetch(api);
    const data = await response.json();
    console.log(data);
    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);
    return {
        lat,
        lon
    };
}
function calculateImpact(magnitude, distance) {
    if (distance < 1) distance = 1;
    const impact = magnitude - Math.log10(distance/1000);
    return impact > 0 ? impact : 0;
}
function getDates(timestamp = Date.now()) {
    const currentDate = new Date(timestamp*1000);
    const formattedCurrentDate = currentDate.toISOString().split('T')[0];
    const twoDaysAgo = new Date(timestamp*1000);
    twoDaysAgo.setDate(currentDate.getDate() - 2);
    const formattedTwoDaysAgo = twoDaysAgo.toISOString().split('T')[0];
    return {
        currentDate: formattedCurrentDate,
        twoDaysAgo: formattedTwoDaysAgo
    };
}
if ('serviceWorker' in navigator) {  
    window.addEventListener('load', () => {  
        navigator.serviceWorker.register('/danhgiasatlodat/service-worker.js')  
            .then((registration) => {  
                console.log('Service Worker registered with scope:', registration.scope);  
            })  
            .catch((error) => {  
                console.log('Service Worker registration failed:', error);  
            });  
    });  
}
document.querySelectorAll('.map-switch button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
document.addEventListener('DOMContentLoaded', function () {
    const popup = document.querySelector('.popup');
    const openPopupButton = document.querySelector('.openPopup');
    openPopupButton.addEventListener('click', () => {
        if (popup.style.display === 'flex') {
            popup.style.bottom = '-100%';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        } else {
            popup.style.display = 'flex';
            setTimeout(() => {
                popup.style.bottom = '0';
            }, 50);
        }
    });
    document.addEventListener('DOMContentLoaded', function () {
        const openPopupButton = document.getElementById('openPopup');
        if (openPopupButton && popup) {
        }
    });
    const button = document.querySelector('.openPopup');
    const tooltip = document.querySelector('.tooltip-text');
    button.addEventListener('mouseenter', () => {
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
    });

    button.addEventListener('mouseleave', () => {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    });
        document.querySelectorAll('#popupContent').forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    });
    document.querySelectorAll('.popup-button button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    document.querySelectorAll('.current button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    document.querySelectorAll('.map-content button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    const imageContainer = document.querySelector('.map-explain');
     const button = document.querySelector('.map-content button');
     
     button.addEventListener('click', () => {
         imageContainer.classList.toggle('active');
     });
