var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function shuffle_array(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function is_empty_object(obj) {
    return Object.keys(obj).length === 0;
}
class flagGame {
    constructor(url, game_container) {
        this.url = url;
        this.game_container = game_container;
        this.url = url;
        if (!game_container) {
            throw new Error("There is no container");
        }
        this.game_container = game_container;
    }
    get_flags() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rawData = yield fetch(this.url);
                const jsonData = yield rawData.json();
                return jsonData;
            }
            catch (err) {
                console.error(err);
                return {};
            }
        });
    }
    create_image_elements(jsonData) {
        const ordered_keys = shuffle_array(Object.keys(jsonData));
        for (let key of ordered_keys) {
            const img = document.createElement("img");
            img.src = jsonData[key]['url'];
            img.classList.add("flag-item");
            img.id = jsonData[key]['id'];
            this.game_container.appendChild(img);
        }
    }
    create_flag_order(jsonData) {
        return;
    }
    run_game() {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonData = yield this.get_flags();
            if (is_empty_object(jsonData)) {
                throw new Error("Can't fetch data");
            }
            this.create_image_elements(jsonData);
        });
    }
}
function main() {
    const url = "./flags/flags.json";
    const container = document.querySelector("#flagContainer");
    if (!container) {
        throw new Error("There is no container passed");
    }
    const gameObject = new flagGame(url, container);
    gameObject.run_game();
}
main();
export {};
//# sourceMappingURL=script.js.map