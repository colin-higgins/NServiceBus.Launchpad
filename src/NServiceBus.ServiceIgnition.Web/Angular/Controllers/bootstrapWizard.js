(function (ng) {

    var controller = function ($scope, bootstrapService, educationService) {

        var initialize = function () {

            bootstrapService.getBootstrapBuilder()
                .then(function (builderModel) {
                    $scope.builderModel = builderModel;
                });

            $scope.endpointName = 'Sample.Bootstrapper.Endpoint';

        };

        $scope.setVersionDefaults = function () {

            if (!$scope.selectedVersion)
                return;

            var setDefault = function (key) {
                $scope.selectedVersion[key].selectedItem =
                    $scope.selectedVersion[key].Items[0];
            };

            setDefault('TransportSection');
            setDefault('SerializerSection');
            setDefault('PersistenceSection');
        };

        $scope.bootstrap = function () {

            var version = $scope.selectedVersion;
            var transport = version.TransportSection.selectedItem;
            var endpoints = $scope.endpointList;

            for (var i = 0; i < endpoints.length; i++) {
                endpoints[i].NServiceBusVersion = version.Value;
                endpoints[i].Transport = transport.Value;
            }

            var model = {
                NServiceBusVersion: version.Value,
                Transport: transport.Value,
                EndpointConfigurations: endpoints
            };

            bootstrapService.triggerBootstrapping(model)
                .then(function (bootstrapResult) {
                    $scope.bootstrapResult = bootstrapResult;
                });
        };

        $scope.endpointList = [];
        var defaultEndpointNameTemplate = "Sample.Endpoint";

        $scope.messageDefinitions = {
        };

        $scope.sharedMessages = [];

        var refreshMessages = function () {
            var newList = [];
            for (var key in $scope.messageDefinitions) {
                if ($scope.messageDefinitions.hasOwnProperty(key)) {
                    newList.push(key);
                }
            }
            $scope.sharedMessages = newList;
        };

        $scope.addNewEndpoint = function () {

            var version = $scope.selectedVersion;
            var persistenceSection = ng.copy(version.PersistenceSection);
            var serializerSection = ng.copy(version.SerializerSection);

            var endpoint = {
                EndpointName: defaultEndpointNameTemplate + ($scope.endpointList.length + 1),
                SerializerSection: persistenceSection,
                PersistenceSection: serializerSection,
                MessageHandlers: []
            };

            var messageExists = function(messageName) {

                for (var i = 0; i < endpoint.MessageHandlers.length; i++) {
                    if (endpoint.MessageHandlers[i] === messageName) {
                        return true;
                    }
                }

                return false;
            };

            endpoint.addMessage = function (messageName) {

                if (!messageName
                    || messageName.length === 0
                    || messageExists(messageName)) {
                    return;
                }

                endpoint.MessageHandlers.push(messageName);

                if ($scope.messageDefinitions[messageName] > 0) {
                    $scope.messageDefinitions[messageName]++;
                    return;
                }

                $scope.messageDefinitions[messageName] = 1;
                refreshMessages();
            };

            endpoint.removeMessage = function (messageName) {

                if (!messageExists(messageName)) {
                    return;
                }

                var newMessageList = [];

                for (var i = 0; i < endpoint.MessageHandlers.length; i++) {
                    if (endpoint.MessageHandlers[i] !== messageName) {
                        newMessageList.push(endpoint.MessageHandlers[i]);
                    }
                }

                endpoint.MessageHandlers = newMessageList;

                if (--$scope.messageDefinitions[messageName] < 1) {
                    delete $scope.messageDefinitions[messageName];
                }

                refreshMessages();
            };

            $scope.endpointList.push(endpoint);

        };

        //$scope.$watch('selectedVersion.PersistenceSection.selectedItem', function () {

        //    $scope.persistenceDocumentation = null;

        //    if (!$scope.selectedPersistence || $scope.selectedPersistence.Name === 'None') {
        //        return;
        //    }

        //    educationService
        //        .getDocumentationMarkup($scope.selectedPersistence.Name + 'Persistence NServiceBus')
        //        .then(function (documentationMarkup) {
        //            $scope.persistenceDocumentation = documentationMarkup;
        //        });
        //});

        //$scope.$watch('selectedVersion.TransportSection.selectedItem', function () {

        //    $scope.transportDocumentation = null;

        //    if (!$scope.selectedTransport) {
        //        return;
        //    }

        //    educationService
        //        .getDocumentationMarkup($scope.selectedTransport.Name + 'Transport NServiceBus')
        //        .then(function (documentationMarkup) {
        //            $scope.transportDocumentation = documentationMarkup;
        //        });
        //});

        //$scope.$watch('selectedVersion.SerializerSection.selectedItem', function () {

        //    $scope.serializationDocumentation = null;

        //    if (!$scope.selectedSerializer) {
        //        return;
        //    }

        //    educationService
        //        .getDocumentationMarkup($scope.selectedSerializer.Name + 'Serializer NServiceBus')
        //        .then(function (documentationMarkup) {
        //            $scope.serializationDocumentation = documentationMarkup;
        //        });
        //});

        initialize();
    };

    ng.module('nsbBootstrap').controller('bootstrapWizard', ['$scope', 'bootstrapService', 'educationService', controller]);

})(angular);