(function() {	
	// -----
	// used with partials/admin-representatives.html
	function adminRepresentativesController($scope, $interval, RepresentativeFactory) {
	    var vm = this;
		function errorHandler() {
	    	console.log("Something went wrong with the server ");
	    	console.log(arguments);
	    	vm.number = "MÅ VÆRE TALL!";
	    }
	    function updateRepresentatives() {
	    	RepresentativeFactory.getRepresentativesFromServer()
	    	.success(function(data) {
	    		vm.representatives = data;
	    	})
	    	.error(errorHandler);

	    	resetForm();
	    	
	    	$('#number').focus();
	    }

	    function resetForm() {
		    vm.number = null;
		    vm.name = null;
	    	vm.group = null;
	    	vm.sex = null;
	    }
	    
		// get registered representatives from server
		updateRepresentatives();
	    

	    // variables and submit handler for manually adding speakers


	    vm.postRepresentativeFromForm = function() {
	    	RepresentativeFactory.registerRepresentative([vm.number, vm.name, vm.group, vm.sex])
	    	.success(updateRepresentatives)
	    	.error(errorHandler);
	    };

	    // handler for removing a representative
	    vm.removeRepresentative = function(number) {
	    	RepresentativeFactory.removeRepresentative(number)
	    	.success(updateRepresentatives)
	    	.error(errorHandler);
	    };

	    vm.changeRepresentative = function(representative) {
	    	vm.number = representative.number;
	    	vm.name = representative.name;
	    	vm.group = representative.group;
	    	vm.sex = representative.sex;
	    	$('#number').focus();
	    }

        //Function for handling csv-upload
        $scope.readFileToArray = function(files) {
            var reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onload = function(event) {
                if ( event.target.result.indexOf( String.fromCharCode( 65533 ) ) == -1 ) {
                    var csvText = event.target.result;
                    RepresentativeFactory.registerRepresentativesFromArray(csvText.csvToArray({trim:true, rSep:"\n"}), updateRepresentatives);
                } else {
                    console.log("Note: CSV-file was not utf8, trying iso-8859-1.");
                    reader.onload = function(event) {
                        var csvText = event.target.result;
                        RepresentativeFactory.registerRepresentativesFromArray(csvText.csvToArray({trim:true, rSep:"\n"}), updateRepresentatives);
                    };
                    reader.readAsText(files[0], "iso-8859-1");
                }

            };
        };

        return vm;
	}

	// add it to our bookControllers module
	angular
	    .module('speakerAppControllers')
	    .controller('adminRepresentativesController', adminRepresentativesController);
	// -----
})();
