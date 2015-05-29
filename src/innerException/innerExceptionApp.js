define(['ractive', 'rv!./innerException/innerExceptionAppTemplate', 'css!./innerException/innerExceptionAppStyles'],
    function(Ractive, innerExceptionAppTemplate){

        var innerExceptionApp = function(containerDomId){
            var self = this;
            this.containerDomId = containerDomId;
            this._ractive = new Ractive({
                el:this.containerDomId,
                template: innerExceptionAppTemplate,
                data: {
                    innerExceptions: [
                        {name: 'Billy', innerException:64, failing:true, editing:false},
                        {name: 'Timmy', innerException:75, failing:false, editing:false},
                        {name: 'Sally', innerException:95, failing:false, editing:false}
                    ],
                    statistics: {
                        averageinnerException: 0,
                        minimuminnerException: 0,
                        maximuminnerException: 0
                    }
                }
            });
            //Ractive proxy events from template
            this._ractive.on({
                deleteinnerException: function(event){
                    self.removeinnerException(event.index.i);
                },
                newinnerException: function(event){
                    var innerExceptionInput = event.node.previousElementSibling;
                    var nameInput = innerExceptionInput.previousElementSibling;

                    if(!isNaN(parseInt(innerExceptionInput.value))){
                        self.addinnerException(nameInput.value, innerExceptionInput.value);
                    }
                    else{
                        alert('innerExceptions must be numeric!');
                    }

                    innerExceptionInput.value = '';
                    nameInput.value = '';
                },
                modifyinnerException: function(event){
                    self.editinnerException(event.index.i, '.innerException');
                },
                modifyName: function(event){
                    self.editinnerException(event.index.i, '.name');
                },
                editCompleted: function(event){
                    self._ractive.set(event.keypath + '.editing', false);
                },
                onBlur: function(event){
                    event.node.blur();
                }
            });
            this._ractive.observe('innerExceptions', function(innerExceptions){
                self.setStats(innerExceptions);
                self.setFailing(innerExceptions);
                self.validateinnerExceptions(innerExceptions);
            });
        };

        innerExceptionApp.prototype = {
            addinnerException: function(name, innerException){
                this._ractive.data.innerExceptions.push({
                    name: name,
                    innerException: innerException,
                    editing: false,
                    failing: innerException < 65
                });
            }
        };

        return innerExceptionApp;
});