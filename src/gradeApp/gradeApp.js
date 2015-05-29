define(['ractive', 'rv!/grades/src/gradeApp/gradeAppTemplate.html', 'css!/grades/src/gradeApp/gradeAppStyles'],
    function(Ractive, gradeAppTemplate){

        var gradeApp = function(containerDomId){
            var self = this;
            this.containerDomId = containerDomId;
            this._ractive = new Ractive({
                el:this.containerDomId,
                template: gradeAppTemplate,
                data: {
                    grades: [
                        {name: 'Billy', grade:64, failing:true, editing:false},
                        {name: 'Timmy', grade:75, failing:false, editing:false},
                        {name: 'Sally', grade:95, failing:false, editing:false}
                    ],
                    statistics: {
                        averageGrade: 0,
                        minimumGrade: 0,
                        maximumGrade: 0
                    }
                }
            });
            //Ractive proxy events from template
            this._ractive.on({
                deleteGrade: function(event){
                    self.removeGrade(event.index.i);
                },
                newGrade: function(event){
                    var gradeInput = event.node.previousElementSibling;
                    var nameInput = gradeInput.previousElementSibling;

                    if(!isNaN(parseInt(gradeInput.value))){
                        self.addGrade(nameInput.value, gradeInput.value);
                    }
                    else{
                        alert('Grades must be numeric!');
                    }

                    gradeInput.value = '';
                    nameInput.value = '';
                },
                modifyGrade: function(event){
                    self.editGrade(event.index.i, '.grade');
                },
                modifyName: function(event){
                    self.editGrade(event.index.i, '.name');
                },
                editCompleted: function(event){
                    self._ractive.set(event.keypath + '.editing', false);
                },
                onBlur: function(event){
                    event.node.blur();
                }
            });
            this._ractive.observe('grades', function(grades){
                self.setStats(grades);
                self.setFailing(grades);
                self.validateGrades(grades);
            });
        };

        gradeApp.prototype = {
            addGrade: function(name, grade){
                this._ractive.data.grades.push({
                    name: name,
                    grade: grade,
                    editing: false,
                    failing: grade < 65
                });
            },
            removeGrade: function(index){
                this._ractive.data.grades.splice(index, 1);
            },
            editGrade: function(index, fieldName){
                var keydownHandler, blurHandler,
                    input, currentValue;

                currentValue = this._ractive.get('grades.' + index + fieldName);
                this._ractive.set('grades.' + index + '.editing', true);

                input = this._ractive.find(fieldName + 'Editor');
                input.select();

                var self = this;

                window.addEventListener('keydown',
                keydownHandler = function(event){
                    switch(event.which){
                        case 13:   //Enter
                            input.blur();
                            break;
                        case 27:   //Esc
                            input.value = currentValue;
                            self._ractive.set('grades.' + index + fieldName, currentValue);
                            input.blur();
                            break;
                    }
                });

                input.addEventListener('blur',
                    blurHandler = function () {
                        window.removeEventListener( 'keydown', keydownHandler );
                        input.removeEventListener( 'blur', blurHandler );
                    });

                this._ractive.set('grades.' + index + '.editing', true);
            },
            setStats: function(grades){
                if(grades.length > 0){
                    var total = 0;
                    var min = 100;
                    var max = 0;
                    for(var i=0; i<grades.length; i++){
                        var currentGrade = parseInt(grades[i].grade);
                        total += currentGrade;
                        min > currentGrade ? min = currentGrade : min;
                        max < currentGrade ? max = currentGrade : max;
                    }
                    this._ractive.animate('statistics.averageGrade', total / i);
                    this._ractive.animate('statistics.maximumGrade', max);
                    this._ractive.animate('statistics.minimumGrade', min);
                }
                else{
                    this._ractive.animate('statistics.averageGrade', 0);
                    this._ractive.animate('statistics.maximumGrade', 0);
                    this._ractive.animate('statistics.minimumGrade', 0);
                }
            },
            setFailing: function(grades){
                for(var i=0; i<grades.length; i++){
                    var currentGrade = parseInt(grades[i].grade);
                    this._ractive.set('grades.'+i+'.failing', !(currentGrade >= 65));
                }
            },
            validateGrades: function(grades){
                for(var i=0; i<grades.length; i++){
                    if(isNaN(parseInt(grades[i].grade))){
                        this._ractive.set('grades.'+i+'.grade', -1);
                        alert('Grades must be numeric!');
                    }
                }
            }
        };

        return gradeApp;
});