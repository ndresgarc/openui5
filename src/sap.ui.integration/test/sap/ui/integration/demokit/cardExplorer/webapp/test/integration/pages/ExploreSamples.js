/* global sinon */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/Press",
	"sap/ui/core/util/File",
	"sap/ui/thirdparty/jszip"
], function(Opa5, Properties, Ancestor, Press, File, JSZip) {
	"use strict";

	var sViewName = "ExploreSamples",
		oFileSaveStub,
		oJSZipFileStub;

	Opa5.createPageObjects({
		onTheExploreSamplesPage: {

			actions: {
				iPressDownload: function (sDownloadType) {
					oFileSaveStub = sinon.stub(File, "save");
					oJSZipFileStub = sinon.stub(JSZip.prototype, "file");

					return this.waitFor({
						viewName: sViewName,
						id: "downloadSampleButton",
						actions: new Press(),
						errorMessage: "Could not find tab with name download sample menu",
						success: function (oMenu) {
							return this.waitFor({
								viewName: sViewName,
								controlType: "sap.ui.unified.MenuItem",
								actions: new Press(),
								matchers: [
									new Ancestor(oMenu),
									new Properties({ text: sDownloadType })
								],
								errorMessage: "Could not find MenuItem with text: " + sDownloadType
							});
						}
					});
				},
				iChangeFileEditorValue: function (sValue) {
					return this.waitFor({
						viewName: sViewName,
						id: "fileEditor",
						actions: function (oFileEditor) {
							oFileEditor.setManifestContent(sValue);
						},
						errorMessage: "Could not edit CodeEditor"
					});
				},
				iChangeDropdownValue: function (sText) {
					return this.waitFor({
						viewName: sViewName,
						id: "subSample",
						actions: new Press(),
						success: function(oComboBox) {
							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers: [
									new Ancestor(oComboBox),
									new Properties({ title: sText})
								],
								actions: new Press(),
								errorMessage: "Cannot select " + sText + " from the combo box"
							});
						},
						errorMessage: "Could not change the sub sample"
					});
				}
			},

			assertions: {
				iShouldHaveFile: function (vContent) {
					return this.waitFor({
						check: function () {
							return oFileSaveStub.called;
						},
						success: function () {
							Opa5.assert.ok(true, "File should be downloaded.");

							if (vContent) {
								Opa5.assert.strictEqual(oFileSaveStub.args[0][0], vContent, "Downloaded file content should be correct.");
							}

							// clean up
							oFileSaveStub.restore();
							oJSZipFileStub.restore();
						},
						errorMessage: "Manifest.json file was not downloaded."
					});
				},
				iShouldHaveZip: function (aFilesNames) {
					return this.waitFor({
						check: function () {
							return oFileSaveStub.called;
						},
						success: function () {
							Opa5.assert.ok(true, "Zip file should be downloaded.");

							if (aFilesNames) {
								aFilesNames.forEach(function (sName) {
									Opa5.assert.ok(oJSZipFileStub.calledWith(sName), "Bundle should contain file: " + sName);
								});
							}

							// clean up
							oFileSaveStub.restore();
							oJSZipFileStub.restore();
						},
						errorMessage: "Bundle as zip file was not downloaded."
					});
				},
				iShouldSeeSampleTitle: function (sTitle) {
					return this.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Title",
						matchers: new Properties({text: sTitle}),
						success: function () {
							Opa5.assert.ok(true, "The navigation ended on the correct topic: " + sTitle);
						},
						errorMessage: "The navigation isn't ended on the correct topic: " + sTitle
					});
				},
				iShouldSeeSubSample: function (sKey) {
					return this.waitFor({
						viewName: sViewName,
						controlType: "sap.m.ComboBox",

						matchers: new Properties({selectedKey: sKey}),
						success: function () {
							Opa5.assert.ok(true, "The navigation ended on the correct sub sample: " + sKey);
						},
						errorMessage: "The navigation isn't ended on the correct sub sample: " + sKey
					});
				}
			}
		}
	});
});
