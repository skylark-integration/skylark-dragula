define([
	"./ticky"
],function(ticky){
    return function debounce(fn, args, ctx) {
        if (!fn) {
            return;
        }
        ticky(function run() {
            fn.apply(ctx || null, args || []);
        });
    };

});