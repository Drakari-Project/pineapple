<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</svelte:head>

<script>
    import { Styles } from '@sveltestrap/sveltestrap';
  
    import { onMount } from "svelte";
    
    let file = null;
    let password = $state("");
    let uploadedFileUrl = $state("");
    let savedGame = "";
    let selectedCollection = $state("");
    let newCollection = $state("");
    //Game information
    let name = $state("");
    let description = $state("");
    let dev = $state("");
    let isStudentGame = $state(null);

    let collections = $state([]);

    let fileName = $state("");

    //Used to get list of collections from ES-DE
    onMount(async () => {
    try {
      const response = await fetch("/api/read_collections");
      const data = await response.json();
      collections = data.files || [];
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  });
  function addCollection() {
    if (newCollection.trim() !== "") {
      collections = [...collections, newCollection.trim()]; // Add new item to the array
      newCollection = ""; // Clear input field
    }
  }
  
    function handleFileChange(event) {
      file = event.target.files[0];
      fileName = file ? file.name : "";
    }
  
    async function uploadFile() {

      if(!name)
      {
        alert("No Name set!");
        return;
      }

      if(!selectedCollection)
      {
        alert("No collection selected");
        return;
      }

      if (!file) {
        alert("No file selected!");
        return;
      }
  
      if (!password) {
        alert("Please enter the password!");
        return;
      }
  
      const formData = new FormData();
      formData.append("name", name); //Name of game
      formData.append("description", description);
      formData.append("dev", dev);
      formData.append("collection", selectedCollection);
      formData.append("isStudentGame", isStudentGame);
      formData.append("file", file); //game file
      formData.append("password", password); // Send password with request
      formData.append("command", 1) //Hard set 1 currently for save game

      try {
        const response = await fetch("/savegame", {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
        if (response.ok) {
          uploadedFileUrl = data.fileUrl;
          alert("Game Uploaded" + " (" + name + ")");
        } else {
          alert("Upload failed: " + data.error);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
   
  </script>
    <div class="container-fluid">
      <h1 class="title">
        Drakari
      </h1>
      <p style="font-size: 2em; margin: 0em; border: 0em; padding: 0em; color:#f3e018">
        Pineapple
      </p>
      <div class="position-absolute top-50 start-50" style="background-color: green; outline-style: solid; outline-color: white; color: white;">
          Is a student game?
        <label>
          <input type="radio" bind:group={isStudentGame} value={"true"} />
          true
        </label>
        <label>
          <input type="radio" bind:group={isStudentGame} value={"false"} />
          false
        </label>
        {#if isStudentGame}
        
        <br>
        <br>
      
        <label>
          Name Of Game:
          <input type="text" style="background-color: yellow;" bind:value={name} placeholder="Snake"/>
        </label>
        
        <br>
      
        <label>
          Description:<br>
          <textarea bind:value={description} rows="5" cols="50" style="background-color: yellow;" placeholder="Enter description here..."></textarea>
        </label>
      
        <br>
       
        <label>
          Developer:
          <input type="text" style="background-color: yellow;" bind:value={dev} placeholder="You"/>
        </label>
      
        <br>
        
        <label>
          Select a Collection
          <select style="background-color: #c3c900;" bind:value={selectedCollection}>
            <option value="" disabled selected>Select a collection...</option>
            {#each collections as collection}
              <option value={collection}>{collection}</option>
            {/each}
          </select>
          
        </label>
      
        <br>
      
        <label class="box">
          <input style="background-color: yellow;" type="text" bind:value={newCollection} placeholder="really cool"/> <button style="background-color: #c3c900;" onclick={addCollection}>Add Collection</button>
          Add a new Collection 
        </label>
        
        <br>
        <br>
      
        <label class="file-label">
          Upload ZIP
          <input
            class="hidden-input"
            type="file"
            accept=".zip"
            onchange={handleFileChange}
          />
        </label>
        {#if fileName}
          <span class="file-name">{fileName}</span>
        {/if}
        <br>
        <br>
        <input style="background-color: yellow;" type="password" bind:value={password} placeholder="Enter password" />
        <button style="background-color: #c3c900;" onclick={uploadFile}>Upload Game</button>
        {/if}
        <br>
        <br>
      </div>  
    </div>
  
  <style>
    @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
   .title {
    font-size: 4em;
    margin: 0em;
    border: 0em;
    padding: 0em;
    text-decoration-line: underline;
   }
   .file-label {
    display: inline-block;
    background-color: #c3c900; /* change this to whatever color you want */
    color: white;
    padding: 10px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }

  .file-label:hover {
    background-color: #a6ad00;
  } 
  .hidden-input {
    display: none;
  }
  </style>
