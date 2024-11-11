document.addEventListener("DOMContentLoaded", () => {
    const albumForm = document.getElementById("albumForm");
    const addedAlbumList = document.getElementById("addedAlbumList");
    const apiAlbumList = document.getElementById("apiAlbumList");
    const searchDiscographyButton = document.getElementById("searchDiscography");
    const coverLinkInput = document.getElementById("coverLink");
    const coverImage = document.getElementById("coverImage");

    // Evento para agregar discos manualmente 
    albumForm.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const groupName = document.getElementById("groupName").value;
        const albumName = document.getElementById("albumName").value;
        const coverLink = document.getElementById("coverLink").value;

        addAlbumToList(addedAlbumList, groupName, albumName, coverLink, true);

        albumForm.reset();
        coverImage.style.display = "none"; // Ocultar la imagen de la portada al enviar el formulario
    });

    // Mostrar la imagen de la portada cuando se ingresa un link
    coverLinkInput.addEventListener("input", () => {
        const url = coverLinkInput.value;

        if (url) {
            coverImage.src = url;
            coverImage.style.display = "block"; // Mostrar la imagen
        } else {
            coverImage.style.display = "none"; // Ocultar la imagen si el link está vacío
        }
    });

    function addAlbumToList(listElement, groupName, albumName, coverLink, showDeleteIcon = false) {
        const albumItem = document.createElement("div");
        albumItem.classList.add("album-item");

        // Construir el contenido del álbum sin el ícono de papelera
        let albumContent = `
            <div>
                <img src="${coverLink}" alt="${albumName}">
                <strong>${albumName}</strong> - ${groupName}
            </div>
        `;

        // Agregar el ícono de papelera solo si `showDeleteIcon` es `true`
        if (showDeleteIcon) {
            albumContent += `<span class="trash-icon">🗑️</span>`; //&#x1F5D1;
        }

        albumItem.innerHTML = albumContent;

        if (showDeleteIcon) {
            const deleteButton = albumItem.querySelector(".trash-icon");
            deleteButton.addEventListener("click", () => {
                albumItem.remove();
            });
        }

        listElement.appendChild(albumItem);
    }

    async function fetchDiscography(artist) {
        const apiKey = "";
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${artist}&api_key=${apiKey}&format=json`;

        resetProgress(); // Resetear la barra de progreso antes de iniciar la búsqueda

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.topalbums) {
                apiAlbumList.innerHTML = ""; 

                const totalAlbums = data.topalbums.album.length;
                let currentAlbum = 0;

                // Cargar los álbumes uno por uno para actualizar el progreso
                for (const album of data.topalbums.album) {
                    addAlbumToList(apiAlbumList, artist, album.name, album.image[2]['#text'], false);

                    currentAlbum++;
                    updateProgress((currentAlbum / totalAlbums) * 100);

                    // Dar tiempo para que se vea la actualización de la barra
                    await delay(50); // Retraso de 50ms
                }

                // Asegurar que la barra de progreso termine al 100% al final
                updateProgress(100);
            } else {
                alert("No se encontró la discografía para este grupo.");
            }
        } catch (error) {
            console.error("Error al consultar la API de LastFM:", error);
        }

        // Finalizar el progreso al 100%
        completeProgress();
    }

    // Llamada a la función cuando se hace clic en el botón de "Buscar Discografía"
    searchDiscographyButton.addEventListener("click", () => {
        const artist = document.getElementById("groupName").value;
        if (artist) {
            fetchDiscography(artist);
        } else {
            alert("Por favor ingrese el nombre del grupo para buscar.");
        }
    });
});

// Funciones auxiliares
function updateProgress(percentage) {
    const progressText = document.getElementById('progressText');
    progressText.style.width = percentage + '%';
    progressText.innerText = 'DISCOGRAFIA CARGADA'.substring(0, Math.floor(percentage / 2)); // Ajustar el texto según el progreso

    // Cambiar el color del texto según el progreso
    if (percentage <= 33) {
        progressText.style.color = '#566573'; 
    } else if (percentage <= 66) {
        progressText.style.color = '#273746'; 
    } else {
        progressText.style.color = '#17202a'; 
    }
}

function completeProgress() {
    updateProgress(100); // Completar la barra al 100%
}

function resetProgress() {
    // Resetear la barra de progreso al 0% antes de cada carga de API
    updateProgress(0);
}

// Función de retardo para dar tiempo a que se vea la actualización del progreso
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
