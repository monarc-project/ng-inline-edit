(function(window, angular, undefined) {
  'use strict';

  angular
    .module('angularInlineEdit.directives', [
      'angularInlineEdit.providers',
      'angularInlineEdit.controllers'
    ])
    .directive('inlineEdit', ['$compile', 'InlineEditConfig', 'InlineEditConstants',
      function($compile, InlineEditConfig, InlineEditConstants) {
        return {
          restrict: 'A',
          controller: 'InlineEditController',
          scope: {
            model: '=inlineEdit',
            callback: '&inlineEditCallback',
            validate: '&inlineEditValidation'
          },
          link: function(scope, element, attrs) {
            scope.model = scope.$parent.$eval(attrs.inlineEdit);
            scope.isInputTextarea = attrs.hasOwnProperty('inlineEditTextarea');

            var onBlurBehavior = attrs.hasOwnProperty('inlineEditOnBlur') ?
              attrs.inlineEditOnBlur : InlineEditConfig.onBlur;
            if (onBlurBehavior === InlineEditConstants.CANCEL ||
                onBlurBehavior === InlineEditConstants.SAVE) {
              scope.isOnBlurBehaviorValid = true;
              scope.cancelOnBlur = onBlurBehavior === InlineEditConstants.CANCEL;
            }

            var container = angular.element(
              '<div class="ng-inline-edit" ' +
                'ng-class="{\'ng-inline-edit--validating\': validating, ' +
                  '\'ng-inline-edit--error\': validationError}">');

            var input = angular.element(
              (scope.isInputTextarea ?
                '<textarea ' : '<input type="text" ') +
                'class="ng-inline-edit__input" ' +
                'ng-disabled="validating" ' +
                'ng-show="editMode" ' +
                'ng-keyup="onInputKeyup($event)" ' +
                'ng-model="inputValue" ' +
                'placeholder="{{placeholder}}" />');

            var innerContainer = angular.element(
              '<div class="ng-inline-edit__inner-container"></div>');

            // text
            innerContainer.append(angular.element(
              '<span class="ng-inline-edit__text" ' +
                'ng-class="{\'ng-inline-edit__text--placeholder\': !model}" ' +
                (attrs.hasOwnProperty('inlineEditOnClick') || InlineEditConfig.editOnClick ?
                  'ng-click="editText()" ' : '') +
                'ng-if="!editMode">{{(model || placeholder)' +
                  (attrs.hasOwnProperty('inlineEditFilter') ? ' | ' + attrs.inlineEditFilter : '') +
                  '}}</span>'));

            // edit button
            var inlineEditBtnEdit = attrs.hasOwnProperty('inlineEditBtnEdit') ?
              attrs.inlineEditBtnEdit : InlineEditConfig.btnEdit;
            if (inlineEditBtnEdit) {
              innerContainer.append(angular.element(
                '<a class="ng-inline-edit__button ng-inline-edit__button--edit" ' +
                  'ng-if="!editMode" ' +
                  'ng-click="editText()">' +
                    inlineEditBtnEdit +
                '</a>'));
            }

            // save button
            var inlineEditBtnSave = attrs.hasOwnProperty('inlineEditBtnSave') ?
              attrs.inlineEditBtnSave : InlineEditConfig.btnSave;
            if (inlineEditBtnSave) {
              innerContainer.append(angular.element(
                '<a class="ng-inline-edit__button ng-inline-edit__button--save" ' +
                  'ng-if="editMode && !validating" ' +
                  'ng-click="applyText(false, false)">' +
                    inlineEditBtnSave +
                '</a>'));
            }

            // cancel button
            var inlineEditBtnCancel = attrs.hasOwnProperty('inlineEditBtnCancel') ?
              attrs.inlineEditBtnCancel : InlineEditConfig.btnCancel;
            if (inlineEditBtnCancel) {
              innerContainer.append(angular.element(
                '<a class="ng-inline-edit__button ng-inline-edit__button--cancel" ' +
                  'ng-if="editMode && !validating" ' +
                  'ng-click="applyText(true, false)">' +
                    inlineEditBtnCancel +
                '</a>'));
            }

            container
              .append(input)
              .append(innerContainer);

            element
              .append(container);

            var inlineEditGroup = attrs.hasOwnProperty('inlineEditGroup') ?
              attrs.inlineEditGroup : InlineEditConfig.defaultGroup;
            scope.group = inlineEditGroup;
            if(scope.$parent.listElements == undefined){
              scope.$parent.listElements = [];
            }
            if(scope.$parent.listElements[scope.group] == undefined){
              scope.$parent.listElements[scope.group] = {};
            }

            var inlineEditPosition = attrs.hasOwnProperty('inlineEditPosition') ?
              attrs.inlineEditPosition : (Object.keys(scope.$parent.listElements[scope.group]).length);
            scope.position = parseInt(inlineEditPosition) < 0 ? 0 : parseInt(inlineEditPosition);
            if(scope.position < Object.keys(scope.$parent.listElements[scope.group]).length && scope.$parent.listElements[scope.group][scope.position] != undefined){
              var newElement = {};
              for(var i in scope.$parent.listElements[scope.group]){
                if(parseInt(i) >= scope.position){
                  var s = scope.$parent.listElements[scope.group][i];
                  s.position = parseInt(s.position) + 1;
                  newElement[s.position] = s;
                }else{
                  newElement[i] = scope.$parent.listElements[scope.group][i];
                }
              }
              scope.$parent.listElements[scope.group] = newElement;
            }
            scope.$parent.listElements[scope.group][scope.position] = scope;

            scope.editInput = input;

            attrs.$observe('inlineEdit', function(newValue) {
              scope.model = scope.$parent.$eval(newValue);
              $compile(element.contents())(scope);
            });

            attrs.$observe('inlineEditPlaceholder', function(placeholder) {
              scope.placeholder = placeholder;
            });

            scope.$watch('model', function(newValue) {
              if (!isNaN(parseFloat(newValue)) && isFinite(newValue) && newValue === 0) {
                scope.model = '0';
              }
            });

            scope.$on("$destroy",function handleDestroyEvent(){
              var pos = parseInt(scope.position);
              delete scope.$parent.listElements[scope.group][pos];
              for(var i in scope.$parent.listElements[scope.group]){
                i = parseInt(i);
                if(i > pos){
                  var s = scope.$parent.listElements[scope.group][i];
                  delete scope.$parent.listElements[scope.group][i];
                  s.position = parseInt(s.position) - 1;
                  scope.$parent.listElements[scope.group][s.position] = s;
                }
              }
            });
          }
        };
      }
    ]);

})(window, window.angular);
