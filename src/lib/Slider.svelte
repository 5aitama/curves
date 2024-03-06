<main>
    <div class="background"></div>
    <div class="cursor"></div>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 10px;
    }

    .background {
        width: 100%;
        height: 100%;
        background: rgb(32, 32, 32);
        border-radius: 10px;
    }

    .cursor {
        position: absolute;
        left: 0;
        top: 0px;

        transform: translateY(-25%);
        
        width: 16px;
        height: 16px;
        border-radius: 16px;
        background: rgb(255, 255, 255);
        border: 1px solid rgb(190, 190, 190);
    }
</style>