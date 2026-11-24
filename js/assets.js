


window.OasisAssets = (() => {
  const folder = "assets/images/";

  const files = [
      "Cracked Desert Dunes with Lone Rock.png",
      "Matched_Smooth_Desert.png",
      "Ground1.png",
      "Ground2.png",
      "Smooth_Desert_BG.png",
      "Ghaf_tree_OA2.png",
      "Group3.png",
      "Oasis.png",
      "sun.png",
      "Snow.png",
      "Clown_fish.png",
      "Ghaf_tree.png",
      "Penguin.png",
      "Elephant.png",
      "Fox_2.png",
      "Rock_01.png",
      "Sand.png",
      "Mud.png",
      "Ocean_wave.png",
      "Ice_surface.png",
      "Orynx.png",
      "Lizard.png",
      "Food.png",
      "Pine_tree.png"
  ];

  const images = {};

  async function load() {
      await Promise.all(
          files.map(file => {
              return new Promise(resolve => {
                  const img = new Image();

                  img.onload = () => {
                      images[file] = img;
                      resolve();
                  };

                  img.onerror = () => {
                      console.warn(
                          "Missing asset:",
                          file
                      );
                      resolve();
                  };

                  img.src = folder + file;
              });
          })
      );

      return images;
  }

  function get(file) {
      return images[file] || null;
  }

  return {
      load,
      get,
      folder
  };
})();
