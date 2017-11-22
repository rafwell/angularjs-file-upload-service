angular.module('app')
.directive('ngFileUploadService', function(){
	return {
		scope: {
			ngModel:'='
		},
		restrict: 'A',
		require: 'ngModel',
        replace: true,
		link: function(scope, element, attrs, ngModel){			
			element.on('change', function(e){				
				scope.ngModel = e.target.files[0] ? e.target.files[0] : null;
				scope.$apply();
			});
		}
	};
})
.service('FileUploadService', function($http){
	var that = this;
	this.upload = function(config){

		var p1 = new Promise(function(resolve, reject){
			var fd = new FormData();

			that.parseFormData(config.data, fd, null);

			if(config.method && config.method != "POST"){
				//com método patch diretamente não foi possível obter os dados enviados 
				fd.append('_method', 'PATCH');
			}

			$.ajax({
	            type: 'POST',
	            dataType: 'JSON',
	            url: config.url,
	            data: fd,
	            async: true,
	            cache: false,
	            contentType: false,
	            processData: false,
	            xhr: function() {
	                var myXhr = $.ajaxSettings.xhr();
	                if(myXhr.upload){                	
	                    myXhr.upload.addEventListener('progress', config.progress, false);
	                }
	                return myXhr;
	        	}
	        }).done(function (response) {
	            resolve({
	            	data: response
	            });
	        }).fail(function (response) {
	            reject({
	            	data: response.responseJSON,
	            	status: response.status,
	            	statusText: response.statusText
	            });
	        });
		});

		return p1;
	};

	this.parseFormData = function(data, fd, parentKey){
		//criar o objeto form data recursivamente
		for(var k in data){
			if(angular.isArray(data[k])){
				for(var j in data[k]){
					if(parentKey){						
						var pKey = parentKey+k+'['+j+']';
					}else{
						var pKey = k+'['+j+']';
					}
					that.parseFormData(data[k][j], fd, pKey);
				}				
			}else{			
				if(data[k]!==null){
					if(angular.isObject(data[k]) && !(data[k] instanceof File)){
						for(var j in data[k]){
							if(parentKey)
								fd.append(parentKey+'['+k+']['+j+']', data[k][j]);
							else{
								var value = data[k];
								fd.append(k+'['+j+']', data[k][j]);
							}
						}
					}else{
						if(parentKey){
							if(!angular.isFunction(data[k]))
								fd.append(parentKey+'['+k+']', data[k]);
							else
								fd.append(parentKey, data);
						}
						else{
							var value = data[k];
							fd.append(k, data[k]);
						}
					}
				}
			}
		};		
	};
	
});