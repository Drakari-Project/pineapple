<script>
    
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

      try {
        const response = await fetch("/savegame", {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
        if (response.ok) {
          uploadedFileUrl = data.fileUrl;
        } else {
          alert("Upload failed: " + data.error);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    async function saveGame() {
        try {
          const response = await fetch("/savegame", {
            method: "POST",
            body: fromData,
          });
        const data = await response.json();
        if (response.ok){
          savedGame = "saved game";
        }
        } catch (error) {
          console.error("Game save failed")
        }
    }
  </script>
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
    <input type="text" bind:value={name} placeholder="Snake"/>
  </label>
  
  <br>

  <label>
    Description:<br>
    <textarea bind:value={description} rows="5" cols="50" placeholder="Enter description here..."></textarea>
  </label>

  <br>
 
  <label>
    Developer:
    <input type="text" bind:value={dev} placeholder="You"/>
  </label>

  <br>
  
  <label>
    Select a Collection
    <select bind:value={selectedCollection}>
      <option value="" disabled selected>Select a collection...</option>
      {#each collections as collection}
        <option value={collection}>{collection}</option>
      {/each}
    </select>
    
  </label>

  <br>

  <label>
    <input type="text" bind:value={newCollection} placeholder="really cool"/> <button onclick={addCollection}>Add Collection</button>
    Add a new Collection 
  </label>
  
  <br>
  <br>

  <input accept=".zip" type="file" onchange={handleFileChange} /><br><br>
  <input type="password" bind:value={password} placeholder="Enter password" />
  <button onclick={uploadFile}>Upload Game</button>
  {/if}
  

  {#if uploadedFileUrl}
    <p>Game uploaded successfully!</p>
  {/if}
  