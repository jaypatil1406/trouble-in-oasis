

window.OasisActivities = (() => {
    const items = [
        ['snow', 'Snow', 'Snow.png', 0],
        ['clownfish', 'Clownfish', 'Clown_fish.png', 0],
        ['tree', 'Ghaf tree', 'Ghaf_tree.png', 2],
        ['penguin', 'Penguin', 'Penguin.png', 0],
        ['elephant', 'Elephant', 'Elephant.png', 0],
        ['oasis', 'Oasis', 'Oasis.png', 1],
        ['fox', 'Fox', 'Fox_2.png', 2],
        ['rocks', 'Rocks', 'Rock_01.png', 1],
        ['sand', 'Sand', 'Sand.png', 1],
        ['mud', 'Mud', 'Mud.png', 0],
        ['waves', 'Ocean waves', 'Ocean_wave.png', 0],
        ['ice', 'Ice surface', 'Ice_surface.png', 0],
        ['oryx', 'Oryx', 'Orynx.png', 2],
        ['lizard', 'Lizard', 'Lizard.png', 2],
        ['grass', 'Desert grasses', 'Food.png', 2],
        ['pine', 'Pine tree', 'Pine_tree.png', 0]
    ].map(([id, label, file, part]) => ({
        id,
        label,
        file,
        part
    }));

    const targets = {
        oasis: {
            x: 800,
            y: 585,
            width: 800
        },

        rocks: {
            x: 1450,
            y: 700,
            width: 230
        },

        sand: {
            x: 750,
            y: 700,
            width: 215
        },

        tree: {
            x: 1200,
            y: 170,
            width: 600
        },

        fox: {
            x: 805,
            y: 560,
            width: 190,
            flipX: true
        },

        oryx: {
            x: 1610,
            y: 500,
            width: 200
        },

        lizard: {
            x: 1490,
            y: 750,
            width: 145
        },

    
        grass: {
            x: 1090,
            y: 490,
            width: 145
        }
    };

    const required = {
        1: ['oasis', 'rocks', 'sand'],
        2: ['tree', 'fox', 'oryx', 'lizard', 'grass']
    };

    return {
        items,
        targets,
        required
    };
})();
