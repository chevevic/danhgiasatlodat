async function getweather(lat,lon) {
    try {
    const api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=5ecd55a45b022c71aede9450aaffb59d`;
    const api_url11 =  `https://api.open-meteo.com/v1/elevation?latitude=${lat - 0.0004}&longitude=${lon - 0.0004}`;
    const api_url2 =`https://rest.isric.org/soilgrids/v2.0/classification/query?lon=${lon}&lat=${lat}&number_classes=12`
    const response = await fetch(api_url);
    const json = await response.json();
    console.log(json);
    const enddate = getDates(json.dt).currentDate;
    const startdate = getDates(json.dt).twoDaysAgo;
    const api_url12 = `https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${lat + 0.0004}&longitude=${lon + 0.0004}&start_date=${startdate}&end_date=${enddate}&daily=precipitation_sum&timezone=Asia%2FBangkok`
    const response12 = await fetch(api_url12);
    const hourly = await response12.json();
    console.log(hourly);
    const elevation11 = await fetch(api_url11);;
    const elevationData1 = await elevation11.json();
    const elevation1 = elevationData1.elevation[0];
    const elevation2 = hourly.elevation;
    const distance = getDistance(lat-0.0004, lon-0.0004, lat + 0.0004, lon + 0.0004); 
    const slope = Math.atan((Math.abs(elevation2 - elevation1)) / distance)*(180 / Math.PI);
    console.log(`Slope: ${slope} °`);
    const response2 = await fetch(api_url2);
    const soiltype = await response2.json();
    console.log(soiltype);
    const api_url6 = `https://us1.locationiq.com/v1/reverse?key=pk.0d07b084d9adef628f0e7240262d65e6&lat=${lat}&lon=${lon}&format=json&`;
    const response6 = await fetch(api_url6);
    const locationdata = await response6.json();
    console.log(locationdata);
    const response3 = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];
(
  way["landuse"](around:500, ${lat}, ${lon});
  relation["landuse"](around:500, ${lat}, ${lon});
  node["landuse"](around:500, ${lat}, ${lon});

  way["natural"](around:500, ${lat}, ${lon});
  relation["natural"](around:500, ${lat}, ${lon});
  node["natural"](around:500, ${lat}, ${lon});

  way["highway"](around:500, ${lat}, ${lon});
  relation["highway"](around:500, ${lat}, ${lon});
  node["highway"](around:500, ${lat}, ${lon});

  way["building"](around:500, ${lat}, ${lon});
  relation["building"](around:500, ${lat}, ${lon});
  node["building"](around:500, ${lat}, ${lon});

  way["power"](around:500, ${lat}, ${lon});
  relation["power"](around:500, ${lat}, ${lon});
  node["power"](around:500, ${lat}, ${lon});
);
out body;`);

    landuse = await response3.json();
    const ways = landuse.elements.filter(item => item.type === 'way');
    const nodes = landuse.elements.filter(item => item.type === 'node');
    const wayWithMinId = ways.reduce((minWay, currentWay) => {
        return currentWay.id < minWay.id ? currentWay : minWay;
    }, ways[0]);
    const nodeWithMinId = nodes.reduce((minNode, currentNode) => {
        return currentNode.id < minNode.id ? currentNode : minNode;
    }, nodes[0]);
    
    const container = document.getElementById("ways-container");
    container.innerHTML = '';
    const tagsContainer = document.createElement("div");
    if (wayWithMinId && wayWithMinId.tags) {
        for (const [key, value] of Object.entries(wayWithMinId.tags)) {
            const tagElement = document.createElement("p");
            tagElement.innerHTML = `<strong>${key}:</strong> ${value}`;
            tagsContainer.appendChild(tagElement);
        }
    } else {
        const noDataElement = document.createElement("p");
        noDataElement.innerHTML = '0';
        tagsContainer.appendChild(noDataElement);
    }
    
    if (nodeWithMinId && nodeWithMinId.tags) {
        for (const [key, value] of Object.entries(nodeWithMinId.tags)) {
            const tagElement = document.createElement("p");
            tagElement.innerHTML = `<strong>${key}:</strong> ${value}`;
            tagsContainer.appendChild(tagElement);
        }
    } else {
        const noDataElement = document.createElement("p");
        noDataElement.innerHTML = '0';
        tagsContainer.appendChild(noDataElement);
    }
    container.appendChild(tagsContainer);
    console.log(landuse)
    const radius = 500;
    const Density = calculateDensity(landuse,lat,lon,radius);
    const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson?latitude=${lat}&longitude=${lon}&maxradius=1000`;
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
        landuse,
        Density,
        Impact,
        moist,
        locationdata
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
function calculateLandslideRisk(hazard, exposure, vulnerability) {
    if (hazard < 0 || exposure < 0 || vulnerability < 0) {
        return "Giá trị không hợp lệ. Tất cả các tham số phải lớn hơn hoặc bằng 0.";
    }
    let risk = hazard * exposure * vulnerability;
    return `Rủi ro sạt lở đất: ${risk}`;
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
function calculatehazard(slope,rain,wind,soil,seismic,humid) {
    hazard = (((0.4 * slope) + (0.28 * rain) + (0.06 * soil) + (0.15 * humid) + (0.11 * wind) + (0.04 * seismic)) * 100).toFixed(0);
    return hazard
}
function getslopeFactor(slope) {
    return (slope / (40));
}
function getrainFactor(rainfall) {
    if (rainfall < 9 ) return 0;
    if (rainfall >= 9 && rainfall < 14) return 0.025;
    if (rainfall >= 14 && rainfall < 20) return 0.2;
    if (rainfall >= 20 && rainfall < 27) return 0.4;
    if (rainfall >= 27 && rainfall < 35) return 0.6;
    if (rainfall >= 35 && rainfall < 42) return 0.8;
    if (rainfall >= 42 && rainfall < 50) return 0.9;
    return 1.0;
}
function getsoilFactor(soil) {
    if (soil === "arenosols" || soil === "histosols") return 1.0;
    if (soil === "Vertisols" || soil === "Gleysols") return 0.75;
    if (soil === "Cambisols" || soil === "Acrisols") return 0.6;
    if (soil === "Fluvisols" || soil === "Andosols" || soil === "phaeozems" ) return 0.4;
    if (soil === "Luvisols" || soil === "Ferralsols" )  return 0.2;
    return 0;
}
function getwindFactor(wind) {
    if (wind <= 6) return 0;
    if (wind > 6 && wind < 10) return 0.025;
    if (wind >= 10 && wind < 16) return 0.1;
    if (wind >= 16 && wind < 22) return 0.4;
    if (wind >= 22 && wind <= 30) return 0.6;
    if (wind > 30 && wind <=42) return 0.8;
    return 1.0;
}
function getsoilmoistureFactor(humid) {
if (humid > 25) return ((humid - 25)/(75));
else return ((25 - humid)/(25));
}
function calculateDensity(data, lat, lon, radius) {
    let buildingCount = 0;
    let highwayCount = 0;
    let powerCount = 0;
    let total = 0;
    data.elements.forEach(element => {
        const elementLat = element.lat;
        const elementLon = element.lon;
        distance = getDistance(lat,lon,elementLat,elementLon);
        if (distance < radius) {
            if (element.tags && element.tags.building) buildingCount++;
            if (element.tags && element.tags.highway) highwayCount++;
            if (element.tags && element.tags.power) powerCount++;
    }})
    const buildingDensity = buildingCount / (Math.PI * radius * radius);
    const highwayDensity = highwayCount / (Math.PI * radius * radius);
    const powerDensity = powerCount / (Math.PI * radius * radius);

    total = (buildingDensity + highwayDensity + powerDensity)*1000000;

    return total;
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
        navigator.serviceWorker.register('/service-worker.js')  
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
var locations = [
    { coords: [22.3045, 103.7732], iconUrl: 'pictures/1warning.png', radius: 35000, note: 'Dãy Hoàng Liên Sơn' },
    { coords: [22.6162, 104.8339], iconUrl: 'pictures/1warning.png', radius: 20000, note: 'Núi Tây Côn Lĩnh' },
    { coords: [17.3362, 106.4781], iconUrl: 'pictures/1warning.png', radius: 15000, note: 'Dãy Trường Sơn' },
    { coords: [21.1921, 106.8970], iconUrl: 'pictures/1warning.png', radius: 22000, note: 'Núi Ngọc Linh' },
    { coords: [15.0996, 108.1683], iconUrl: 'pictures/1warning.png', radius: 30000, note: 'Dãy núi Đông Triều' },
    { coords: [21.0753, 105.3851], iconUrl: 'pictures/1warning.png', radius: 5000, note: 'Núi Ba Vì' },
    { coords: [16.1579, 107.8473], iconUrl: 'pictures/1warning.png', radius: 15000, note: 'Núi Bạch Mã' },
    { coords: [11.3821, 106.1702], iconUrl: 'pictures/1warning.png', radius: 3000, note: 'Núi Bà Đen' },
    { coords: [12.3634, 108.3087], iconUrl: 'pictures/1warning.png', radius: 10000, note: 'Dãy núi Chư Yang Sin' },
    { coords: [23.2500, 105.3890], iconUrl: 'pictures/1warning.png', radius: 15000, note: 'Cao nguyên Đồng Văn' },
    { coords: [11.8578, 108.4084], iconUrl: 'pictures/1warning.png', radius: 7000, note: 'Núi Lang Biang' },
    { coords: [17.5753, 106.1355], iconUrl: 'pictures/1warning.png', radius: 25000, note: 'Vườn quốc gia Phong Nha-Kẽ Bàng' }
];

locations.forEach(function(location) {
    var customIcon = L.icon({
        iconUrl: location.iconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    L.marker(location.coords, { icon: customIcon }).addTo(map)
        .bindPopup(location.note + '<br><b>Địa Hình Phức Tạp<b>');
        L.circle(location.coords, {
            color: 'light-red',
            fillColor: 'red',
            fillOpacity: 0.2,
            radius: location.radius
        }).addTo(map);
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
    const button1 = document.querySelector('.teleport');
    const tooltip1 = document.querySelector('.tooltip-text1');

    button1.addEventListener('mouseenter', () => {
        tooltip1.style.visibility = 'visible';
        tooltip1.style.opacity = '1';
        });
    
        button1.addEventListener('mouseleave', () => {
        tooltip1.style.visibility = 'hidden';
        tooltip1.style.opacity = '0';
        });

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
            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
            toggleVectorGrids(); // Bật/tắt các lớp vectorGrid
        });
    });
    
    const geojsonUrl = 'HeatMap/RiskPlaces.geojson'; // URL hoặc đường dẫn tới tệp GEOJSON
    const geojsonUrl2 = 'HeatMap/RiskPlaces2.geojson'; // URL hoặc đường dẫn tới tệp GEOJSON
    
    let vectorGrid1, vectorGrid2; // Lưu tham chiếu hai lớp
    let currentZoom = 0; // Lưu mức zoom hiện tại
    let vectorGridsVisible = true; // Trạng thái bật/tắt các lớp vectorGrid
    let zoomendEnabled = true; // Kiểm soát sự kiện zoomend
    
    function createVectorGrid(geojsonUrl, callback) {
        fetch(geojsonUrl)
            .then((response) => response.json())
            .then((geojsonData) => {
                // Tiền xử lý GEOJSON: Thêm thuộc tính màu dựa trên giá trị weight
                geojsonData.features.forEach((feature) => {
                    const weight = feature.properties.weight;
                    let fillColor = "purple";
                    if (weight <= 0.06) {
                        fillColor = "transparent";
                    } else if (weight <= 0.1) {
                        fillColor = "lightgreen";
                    } else if (weight <= 0.16) {
                        fillColor = "yellow";
                    } else if (weight <= 0.24) {
                        fillColor = "orange";
                    } else if (weight <= 0.36) {
                        fillColor = "red";
                    }
                    feature.properties.fillColor = fillColor;
                });
    
                // Tạo VectorGrid
                const vectorGrid = L.vectorGrid.slicer(geojsonData, {
                    vectorTileLayerStyles: {
                        sliced: function (properties) {
                            return {
                                color: "black",
                                fill: true,
                                fillColor: properties.fillColor,
                                weight: 0.2,
                                opacity: 1,
                                fillOpacity: 0.6
                            };
                        }
                    },
                    interactive: true
                });
    
                // Xử lý sự kiện click
                vectorGrid.on('click', function (e) {
                    const props = e.layer.properties;
                    alert(`Bạn đã click vào vùng có weight: ${props.weight}`);
                });
    
                callback(vectorGrid);
            })
            .catch((error) => {
                console.error('Không thể tải GEOJSON:', error);
            });
    }
    
    // Tải cả hai lớp
    createVectorGrid(geojsonUrl, (layer) => {
        vectorGrid1 = layer;
        map.addLayer(vectorGrid1); // Thêm lớp vectorGrid1 ban đầu
    });
    
    createVectorGrid(geojsonUrl2, (layer) => {
        vectorGrid2 = layer;
    });
    
    // Lắng nghe sự kiện zoomend
    map.on('zoomend', function () {
        if (!zoomendEnabled) return; // Bỏ qua sự kiện nếu zoomend bị vô hiệu hóa
    
        currentZoom = map.getZoom();
        console.log("Cấp độ zoom:", currentZoom);
    
        if (currentZoom <= 10) {
            if (vectorGrid2 && !map.hasLayer(vectorGrid2)) {
                map.addLayer(vectorGrid2);
            }
            if (vectorGrid1 && map.hasLayer(vectorGrid1)) {
                map.removeLayer(vectorGrid1);
            }
        } else {
            if (vectorGrid1 && !map.hasLayer(vectorGrid1)) {
                map.addLayer(vectorGrid1);
            }
            if (vectorGrid2 && map.hasLayer(vectorGrid2)) {
                map.removeLayer(vectorGrid2);
            }
        }
    });
    
    // Hàm bật/tắt tất cả vectorGrid
    function toggleVectorGrids() {
        zoomendEnabled = !zoomendEnabled; // Đổi trạng thái zoomend
    
        if (vectorGridsVisible) {
            // Tắt tất cả các lớp vectorGrid
            if (vectorGrid1 && map.hasLayer(vectorGrid1)) {
                map.removeLayer(vectorGrid1);
            }
            if (vectorGrid2 && map.hasLayer(vectorGrid2)) {
                map.removeLayer(vectorGrid2);
            }
        } else {
            // Bật lại các lớp vectorGrid theo mức zoom hiện tại
            if (currentZoom <= 10) {
                if (vectorGrid2 && !map.hasLayer(vectorGrid2)) {
                    map.addLayer(vectorGrid2);
                }
            } else {
                if (vectorGrid1 && !map.hasLayer(vectorGrid1)) {
                    map.addLayer(vectorGrid1);
                }
            }
        }    
    
        vectorGridsVisible = !vectorGridsVisible; // Đổi trạng thái hiển thị của các lớp vector grid
        console.log(`Vector grids are now ${vectorGridsVisible ? 'visible' : 'hidden'}`);
        console.log(`Zoomend is now ${zoomendEnabled ? 'enabled' : 'disabled'}`);
    }
