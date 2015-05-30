define(['ractive', 'rv!./innerException/innerExceptionAppTemplate', 'css!./innerException/innerExceptionAppStyles'],
    function(Ractive, innerExceptionAppTemplate){

        var innerExceptionApp = function(containerDomId){
            var self = this;
            this.containerDomId = containerDomId;
            this._ractive = new Ractive({
                el:this.containerDomId,
                template: innerExceptionAppTemplate,
                data: {}
            });
            //Ractive proxy events from template
            this._ractive.on({

            });
            //this._ractive.observe('innerExceptions', function(innerExceptions){
            //    self.setStats(innerExceptions);
            //    self.setFailing(innerExceptions);
            //    self.validateinnerExceptions(innerExceptions);
            //});
        };

        innerExceptionApp.prototype = {

        };

        return innerExceptionApp;
});