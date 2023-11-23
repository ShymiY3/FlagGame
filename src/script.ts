import { json } from "stream/consumers";
type DOMElement = HTMLElement | null


type FlagJson = {
    [key: string]: {
        id: string,
        url: string
    };
};

function scrollIntoViewIfVisible(target: HTMLElement) { 
    if (target.getBoundingClientRect().bottom > window.innerHeight) {
        target.scrollIntoView(false);
    }
    
    if (target.getBoundingClientRect().top < 0) {
        target.scrollIntoView({behavior:"smooth"});
    } 
}

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
    private current_flag: string = '';
    private flag_order: string[] = [];
    private jsonData: FlagJson = {};
    private game_container: DOMElement = null;
    private start_button: DOMElement = null;
    private restart_button: DOMElement = null;
    private guess_text: DOMElement = null;
    private score_text: DOMElement = null;
    private time_text: DOMElement = null;
    private interval_id: ReturnType<typeof setInterval> | null = null;
    private start_time: number = 0;
    private is_game_running: boolean = false;
    private current_score: number = 0;
    private max_score: number = 0;
    constructor(
        private url: string,
    ) {
        this.assign_dom_elements()
    }
    load_and_check(element_id: string): DOMElement {
        const el = document.getElementById(element_id);
        if (!el) throw new Error(`There is no element with id ${element_id}`)
        return el
    }

    assign_dom_elements() {
        this.game_container = this.load_and_check("flagContainer");
        this.start_button = this.load_and_check("startButton");
        this.restart_button = this.load_and_check("restartButton");
        this.guess_text = this.load_and_check("guessText");
        this.score_text = this.load_and_check("scoreText");
        this.time_text = this.load_and_check("timeText");
    }

    async get_flags() {
        try {
            const rawData = await fetch(this.url);
            const jsonData = await rawData.json();
            this.jsonData = jsonData;
        } catch (err) {
            console.error(err);
        }
    }

    get_flag_id(flag_name: string){
        return this.jsonData[flag_name]['id']
    }

    create_image_elements() {
        if (is_empty_object(this.jsonData)) throw new Error("No flags in JSON")
        const ordered_keys = shuffle_array(Object.keys(this.jsonData))
        for (let key of ordered_keys) {
            const img = document.createElement("img");
            img.src = this.jsonData[key]['url'];
            img.classList.add("flag-item");
            img.id = this.get_flag_id(key);
            img.addEventListener('click', () => this.flag_eventlistener(img));
            this.game_container!.appendChild(img);
        }
    }

    flag_eventlistener(element: HTMLElement){
        if(this.is_game_running){
            if(element.id === this.get_flag_id(this.current_flag)){
                this.current_score++;
                this.update_score();
            }
            this.show_correct_flag();
            if(this.is_end_game()){
                this.stop_game();
                return
            } 
            const flag = this.get_current_flag();
            this.current_flag = flag!;
            this.update_guess();
        }
    }

    show_correct_flag(){
        if(this.current_flag){
            const flag = document.getElementById(this.get_flag_id(this.current_flag))
            if(!flag){
                return
            }
            flag.classList.add("flag-guessed");
            scrollIntoViewIfVisible(flag);
        }    
    }

    update_guess(){
        this.guess_text!.textContent = this.current_flag
    }

    update_score(){
        this.score_text!.textContent = `${this.current_score}/${this.max_score}`
    }

    reset_score(){
        this.current_score = 0;
    }

    create_flag_order(): string[] {
        return shuffle_array(Object.keys(this.jsonData))
    }

    
    get_current_flag(): string | undefined{
        return this.flag_order.shift()
    }

    clear_container() {
        while (this.game_container!.firstChild) {
            this.game_container!.removeChild(this.game_container!.firstChild);
        }
    }

    update_time(): [number, number] {
        const elapsed_time = Date.now() - this.start_time
        const sec = Math.floor((elapsed_time / 1000) % 60)
        const min = Math.floor((elapsed_time / (1000 * 60)) % 60)
        return [min, sec]
    }

    update_timer(min: number, sec: number) {
        this.time_text!.textContent = `${min}:${sec.toString().padStart(2, '0')}`
    }

    start_timer() {
        if (!this.interval_id) {
            this.start_time = Date.now();
            this.interval_id = setInterval(() => {
                this.update_timer(...this.update_time())
            }, 200)
        }
    }

    stop_timer() {
        if(this.interval_id){
            clearInterval(this.interval_id)
            this.interval_id = null;
        }
    }

    reset_timer() {
        this.start_time = 0;
    }

    is_end_game():boolean{
        return this.flag_order.length === 0
    }

    start_game() {
        this.flag_order = this.create_flag_order();
        this.start_button!.style.display = "none";
        this.restart_button!.style.display = "block";
        this.max_score = this.flag_order.length
        this.is_game_running = true;
        if(this.is_end_game()){
            throw new Error("Can not start the game; No flags")
        }
        this.start_timer()
        this.update_score();
        this.current_flag = this.get_current_flag()!
        this.update_guess()
    }



    restart_game() {
        this.stop_game()
        this.clear_container()
        this.create_image_elements()
        this.start_button!.style.display = "block";
        this.restart_button!.style.display = "none";
    }

    stop_game(){
        if (this.is_game_running){
            this.stop_timer();
            this.is_game_running = false;
            this.current_flag = '';
            this.update_guess()
            this.reset_score()
            this.reset_timer()
        }
    }

    async run_game() {
        await this.get_flags();
        if (is_empty_object(this.jsonData)) {
            throw new Error("Can't fetch data");
        }
        this.create_image_elements();
        this.start_button?.addEventListener('click', () => this.start_game());
        this.restart_button?.addEventListener('click', () => this.restart_game());
    }
}


function main() {
    const url = "./flags/flags.json";
    const gameObject = new flagGame(url);
    gameObject.run_game()
}

main();
