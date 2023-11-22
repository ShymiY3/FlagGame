import { json } from "stream/consumers";

type FlagJson = {
    [key: string]: {
        id: string,
        url: string
    };
};

type FlagArray = HTMLImageElement[]

function shuffle_array<T>(array: T[]): T[] {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function is_empty_object(obj: Object): boolean {
    return Object.keys(obj).length === 0;
}

class flagGame {
    constructor(
        private url: string,
        private game_container: Element
    ) {
        this.url = url;
        if (!game_container) {
            throw new Error("There is no container")
        }
        this.game_container = game_container;
    }
    async get_flags() {
        try {
            const rawData = await fetch(this.url);
            const jsonData = await rawData.json();
            return jsonData;
        } catch (err) {
            console.error(err);
            return {};
        }
    }
    create_image_elements(jsonData: FlagJson){
        const ordered_keys = shuffle_array(Object.keys(jsonData))
        for (let key of ordered_keys) {
            const img = document.createElement("img");
            img.src = jsonData[key]['url'];
            img.classList.add("flag-item");
            img.id = jsonData[key]['id'];
            this.game_container.appendChild(img);
        }
    }

    create_flag_order(jsonData: FlagJson) {
        return
    }


    async run_game() {
        const jsonData: FlagJson = await this.get_flags();
        if (is_empty_object(jsonData)) {
            throw new Error("Can't fetch data");
        }
        this.create_image_elements(jsonData);
    }
}


function main() {
    const url = "./flags/flags.json";
    const container = document.querySelector("#flagContainer");
    if (!container) {
        throw new Error("There is no container passed")
    }
    const gameObject = new flagGame(url, container)
    gameObject.run_game()
}

main();
