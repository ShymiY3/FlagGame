var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function scrollIntoViewIfVisible(target) {
    if (target.getBoundingClientRect().bottom > window.innerHeight) {
        target.scrollIntoView(false);
    }
    if (target.getBoundingClientRect().top < 0) {
        target.scrollIntoView({ behavior: "smooth" });
    }
}
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
    constructor(url) {
        this.url = url;
        this.current_flag = '';
        this.flag_order = [];
        this.jsonData = {};
        this.game_container = null;
        this.start_button = null;
        this.restart_button = null;
        this.guess_text = null;
        this.score_text = null;
        this.time_text = null;
        this.interval_id = null;
        this.start_time = 0;
        this.is_game_running = false;
        this.current_score = 0;
        this.max_score = 0;
        this.assign_dom_elements();
    }
    load_and_check(element_id) {
        const el = document.getElementById(element_id);
        if (!el)
            throw new Error(`There is no element with id ${element_id}`);
        return el;
    }
    assign_dom_elements() {
        this.game_container = this.load_and_check("flagContainer");
        this.start_button = this.load_and_check("startButton");
        this.restart_button = this.load_and_check("restartButton");
        this.guess_text = this.load_and_check("guessText");
        this.score_text = this.load_and_check("scoreText");
        this.time_text = this.load_and_check("timeText");
    }
    get_flags() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rawData = yield fetch(this.url);
                const jsonData = yield rawData.json();
                this.jsonData = jsonData;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    get_flag_id(flag_name) {
        return this.jsonData[flag_name]['id'];
    }
    create_image_elements() {
        if (is_empty_object(this.jsonData))
            throw new Error("No flags in JSON");
        const ordered_keys = shuffle_array(Object.keys(this.jsonData));
        for (let key of ordered_keys) {
            const img = document.createElement("img");
            img.src = this.jsonData[key]['url'];
            img.classList.add("flag-item");
            img.id = this.get_flag_id(key);
            img.addEventListener('click', () => this.flag_eventlistener(img));
            this.game_container.appendChild(img);
        }
    }
    flag_eventlistener(element) {
        if (this.is_game_running) {
            if (element.id === this.get_flag_id(this.current_flag)) {
                this.current_score++;
                this.update_score();
            }
            this.show_correct_flag();
            if (this.is_end_game()) {
                this.stop_game();
                return;
            }
            const flag = this.get_current_flag();
            this.current_flag = flag;
            this.update_guess();
        }
    }
    show_correct_flag() {
        if (this.current_flag) {
            const flag = document.getElementById(this.get_flag_id(this.current_flag));
            if (!flag) {
                return;
            }
            flag.classList.add("flag-guessed");
            scrollIntoViewIfVisible(flag);
        }
    }
    update_guess() {
        this.guess_text.textContent = this.current_flag;
    }
    update_score() {
        this.score_text.textContent = `${this.current_score}/${this.max_score}`;
    }
    reset_score() {
        this.current_score = 0;
    }
    create_flag_order() {
        return shuffle_array(Object.keys(this.jsonData));
    }
    get_current_flag() {
        return this.flag_order.shift();
    }
    clear_container() {
        while (this.game_container.firstChild) {
            this.game_container.removeChild(this.game_container.firstChild);
        }
    }
    update_time() {
        const elapsed_time = Date.now() - this.start_time;
        const sec = Math.floor((elapsed_time / 1000) % 60);
        const min = Math.floor((elapsed_time / (1000 * 60)) % 60);
        return [min, sec];
    }
    update_timer(min, sec) {
        this.time_text.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    }
    start_timer() {
        if (!this.interval_id) {
            this.start_time = Date.now();
            this.interval_id = setInterval(() => {
                this.update_timer(...this.update_time());
            }, 200);
        }
    }
    stop_timer() {
        if (this.interval_id) {
            clearInterval(this.interval_id);
            this.interval_id = null;
        }
    }
    reset_timer() {
        this.start_time = 0;
    }
    is_end_game() {
        return this.flag_order.length === 0;
    }
    start_game() {
        this.flag_order = this.create_flag_order();
        this.start_button.style.display = "none";
        this.restart_button.style.display = "block";
        this.max_score = this.flag_order.length;
        this.is_game_running = true;
        if (this.is_end_game()) {
            throw new Error("Can not start the game; No flags");
        }
        this.start_timer();
        this.update_score();
        this.current_flag = this.get_current_flag();
        this.update_guess();
    }
    restart_game() {
        this.stop_game();
        this.clear_container();
        this.create_image_elements();
        this.start_button.style.display = "block";
        this.restart_button.style.display = "none";
    }
    stop_game() {
        if (this.is_game_running) {
            this.stop_timer();
            this.is_game_running = false;
            this.current_flag = '';
            this.update_guess();
            this.reset_score();
            this.reset_timer();
        }
    }
    run_game() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.get_flags();
            if (is_empty_object(this.jsonData)) {
                throw new Error("Can't fetch data");
            }
            this.create_image_elements();
            (_a = this.start_button) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.start_game());
            (_b = this.restart_button) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.restart_game());
        });
    }
}
function main() {
    const url = "./flags/flags.json";
    const gameObject = new flagGame(url);
    gameObject.run_game();
}
main();
export {};
//# sourceMappingURL=script.js.map