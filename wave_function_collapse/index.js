const GRAPH = {
  UP: {
    connectsTo: (direction) => {
      switch (direction) {
        case "UP":
          return ["DOWN", "LEFT", "RIGHT"];
        case "DOWN":
          return ["EMPTY"];
        case "LEFT":
          return ["UP", "DOWN", "RIGHT"];
        case "RIGHT":
          return ["UP", "DOWN", "LEFT"];
      }
    },
  },
  DOWN: {
    connectsTo: (direction) => {
      switch (direction) {
        case "UP":
          return ["EMPTY"];
        case "DOWN":
          return ["UP", "LEFT", "RIGHT"];
        case "LEFT":
          return ["UP", "DOWN", "RIGHT"];
        case "RIGHT":
          return ["UP", "DOWN", "LEFT"];
      }
    },
  },
  LEFT: {
    connectsTo: (direction) => {
      switch (direction) {
        case "UP":
          return ["DOWN", "LEFT", "RIGHT"];
        case "DOWN":
          return ["UP", "LEFT", "RIGHT"];
        case "LEFT":
          return ["UP", "DOWN", "RIGHT"];
        case "RIGHT":
          return ["EMPTY"];
      }
    },
  },
  RIGHT: {
    connectsTo: (direction) => {
      switch (direction) {
        case "UP":
          return ["DOWN", "LEFT", "RIGHT"];
        case "DOWN":
          return ["UP", "LEFT", "RIGHT"];
        case "LEFT":
          return ["EMPTY"];
        case "RIGHT":
          return ["UP", "DOWN", "LEFT"];
      }
    },
  },
  EMPTY: {
    connectsTo: (direction) => {
      switch (direction) {
        case "UP":
          return ["UP", "EMPTY"];
        case "DOWN":
          return ["DOWN", "EMPTY"];
        case "LEFT":
          return ["LEFT", "EMPTY"];
        case "RIGHT":
          return ["RIGHT", "EMPTY"];
      }
    },
  },
};

class Canvas {
  #divCanvas;
  #tiles = [];
  #graph;
  #rows;
  #columns;

  constructor(rows, columns, graph) {
    this.#rows = rows;
    this.#columns = columns;
    this.#divCanvas = document.createElement("div");
    this.#graph = graph;

    this.#divCanvas.id = "canvas";

    this.#createCanvas();
    this.#createTiles();

    this.#divCanvas.addEventListener("mouseover", ({ target }) => {
      if (target instanceof HTMLImageElement) {
        const i = Number(target.row);
        const j = Number(target.column);

        const tile = this.getTile(i, j);
        
        const upTile = this.getTile(i - 1, j);
        if (upTile && upTile.isCollapsed()) {
          tile.updateOptions(this.#graph[upTile.getValue()].connectsTo("DOWN"));
        }
        
        const downTile = this.getTile(i + 1, j);
        if (downTile && downTile.isCollapsed()) {
          tile.updateOptions(this.#graph[downTile.getValue()].connectsTo("UP"));
        }
        const leftTile = this.getTile(i, j - 1);
        if (leftTile && leftTile.isCollapsed()) {
          tile.updateOptions(this.#graph[leftTile.getValue()].connectsTo("RIGHT"));
        }

        const rightTile = this.getTile(i, j + 1);
        if (rightTile && rightTile.isCollapsed()) {
          tile.updateOptions(this.#graph[rightTile.getValue()].connectsTo("LEFT"));
        }

        tile.collapseToRandom()

        console.clear();
        console.log(tile.options);
      }
    });

    // this.#divCanvas.addEventListener("click", ({ target }) => {
    //   if (target instanceof HTMLImageElement) {
    //     const i = Number(target.row);
    //     const j = Number(target.column);

    //     const tile = this.getTile(i, j);
    //     tile.collapseToRandom();

    //     this.h1.innerText = `${tile.entropy}`;
    //   }
    // });

    this.h1 = document.createElement("h1");
    this.#divCanvas.appendChild(this.h1);
  }

  #createCanvas() {
    const style = {
      boxSizing: "border-box",
      display: "grid",
      gap: "1px",
      justifyContent: "start",

      gridTemplateRows: `repeat(${this.#rows}, 1fr)`,
      gridTemplateColumns: `repeat(${this.#columns}, 1fr)`,
    };

    Object.assign(this.#divCanvas.style, style);
    document.getElementById("main").appendChild(this.#divCanvas);
  }

  #createTiles() {
    const rows = this.#rows;
    const columns = this.#columns;
    const fragment = document.createDocumentFragment();
    const tileSize = 30;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const tile = new Tile(i, j, tileSize, Object.keys(this.#graph));
        this.#tiles.push(tile);
        fragment.appendChild(tile.divTile);
      }
    }

    this.#divCanvas.appendChild(fragment);
  }

  getTile(i, j) {
    if (i < 0 || i >= this.#rows || j < 0 || j >= this.#columns) {
      return null;
    }
    return this.#tiles[i * this.#columns + j];
  }
}

class Tile {
  #divTile;
  #entropy;
  #options;

  constructor(i, j, tileSize, options) {
    this.#options = options;

    const tileStyle = {
      width: `${tileSize}px`,
      height: `${tileSize}px`,
    };

    const id = `${i}-${j}`;
    this.#divTile = document.createElement("div");
    this.#divTile.id = id;
    Object.assign(this.#divTile.style, tileStyle);

    const img = document.createElement("img");
    img.row = i;
    img.column = j;
    img.alt = `tile-${id}`;
    img.src = "./tiles/NONE.png";

    img.classList.add("tile-img");

    this.#divTile.appendChild(img);

    this.#setEntropy();
  }

  updateOptions(neighborOptions) {
    this.#options = this.#options.filter((option) =>
      neighborOptions.includes(option)
    );

    this.#setEntropy();

    if (this.#entropy === 1) {
      this.collapseTo(this.#options[0]);
    }
  }

  collapseTo(value) {
    this.#divTile.querySelector("img").src = `./tiles/${value}.png`;
  }

  collapseToRandom() {
    const randomIndex = Math.floor(Math.random() * this.#options.length);
    const randomValue = this.#options[randomIndex];
    this.collapseTo(randomValue);
    this.#options = [randomValue];
    this.#setEntropy();
  }

  isCollapsed() {
    return this.#entropy === 1;
  }

  getValue() {
    return this.#entropy === 1 ? this.#options[0] : null;
  }

  #setEntropy() {
    this.#entropy = this.#options.length;
  }

  get divTile() {
    return this.#divTile;
  }

  get entropy() {
    return this.#entropy;
  }

  get options() {
    return this.#options;
  }
}

const FOLDERNAME = "./tiles/";
const EXTENSION = ".png";

const canvas = new Canvas(7, 12, GRAPH);
