﻿// #region *** WIDGET: repository    ***
// API Prefix
var API = "/api/v3";
//
// REPOSITORY: routing
// -- A --
var R_ACTION = API + "/meta/plugins/";
var R_ACTIONS = API + "/meta/plugins";
var R_CONNECTORS = API+ "/meta/connectors";
// -- E --
var R_EXTENSION_ID = "giekjanbmlmabfagaddfkpcijefpgkdf";
// -- O --
var R_OPERATORS = API + "/meta/operators";
// -- P --
var R_PLAYBACK = API + "/rhino/configurations/invoke";
// -- S --
var R_SEND = API + "/integration/create";

// REPOSITORY: elements
// -- A --
var E_ACCESSIBILITY = "#accessibility_id";
var E_ACTION_APPLY = "#action_apply";
var E_ACTION_PLAYBACK = "#action_playback";
var E_ACTION_PLABACK_LINK = "#action_content > div:nth-child(4) > div.card-header > h4 > a";
var E_ACTIONS = "#actions";
var E_ALIAS = "#alias";
var E_ARGUMENT = "#argument";
var E_ATTRIBUTES = "#attributes";
var E_ATTRIBUTES_CONTAINER = "#attributes_container";
var E_ATTRIBUTES_COUNT = "#attributes_count";
// -- B --
var E_BODY = document.body;
// -- C --
var E_CLEAR = "#clear";
var E_COMPONENTS = "#components";
var E_CONNECTOR_CAPABILITIES = "#connector_capabilities";
var E_connectorType = "#connectorType";
var E_CONTENT_WRAPPER = "#content_wrapper";
// -- D ---
var E_DRIVER_CAPABILITIES = "#driver_capabilities";
var E_DRIVER_OPTIONS = "#driver_options";
// -- E --
var E_EXPECTED_VALUE = "#expected_value";
// -- F --
var E_FOOTER = "#footer";
// -- G --
var E_gridEndpoint = "#gridEndpoint";
// -- H --
var E_HEADER = "#header";
var E_HEADER_SCENARIO = "a[href='#scenario']";
var E_HELP_ACTION = "#help_action";
var E_HELP_BADGE = "#help_badge";
var E_HELP_DESCRIPTION = "#help_description";
var E_HELP_ROWS = "#help_rows";
// -- I --
var E_ELEMENT_ID = "#element_id";
var E_IS_ELEMENT = "#is_element";
// -- L --
var E_LINK_TEXT = "#link_text";
var E_LOCATORS_INFORMATION = "#locators_information";
// -- M --
var E_MAIN_CONTAINER = "#main_container";
// -- O --
var E_OPERATORS = "#operators";
// -- P --
var E_PASSWORD = "#password";
var E_PATH = "#path";
var E_PATH_ID = "#path_id";
var E_PLAYBACK_PROGRESS = "#playback_progress";
var E_PROJECT = "#project";
// -- Q --
var E_QUERY_SELECTOR = "#query_selector";
// -- R --
var E_RADIO_ALIAS = "#radio_alias";
var E_RADIO_ACCESSIBILITY = "#radio_accessibility_id";
var E_RADIO_ELEMENT_ID = "#radio_element_id";
var E_RADIO_LINK_TEXT = "#radio_link_text";
var E_RADIO_PATH = "#radio_path";
var E_RADIO_PATH_ID = "#radio_path_id";
var E_RADIO_QUERY_SELECTOR = "#radio_query_selector";
var E_REGULAR_EXPRESSION = "#regular_expression";
// -- S --
var E_SEND = "#send";
var E_SERVER_ADDRESS = "#serverAddress";
var E_STEPS_COUNT = "#steps_count";
// -- T --
var E_TAG_NAME = "#tag_name";
var E_TEST_CASE_LITERAL = "#test_case_literal";
var E_TEST_CASE_TITLE = "#test_case_title";
var E_TEST_STEPS = "#test_steps";
var E_testSuite = "#testSuite";
// -- U --
var E_USER_NAME = "#userName";
// -- W --
var E_webDriver = "#webDriver";
var E_WIDGET_FRAME = "#widget_frame";
var E_WIDGET_TOGGLE = "#widget_toggle";

// REPOSITORY: constants
// -- A --
var C_ACCESSIBILITY = "accessibility id";
// -- C --
var C_CONFIGURATION_NAME = "sr-temp-configuration";
var C_CSS_SELECTOR = "css selector";
// -- D --
var C_DEFAULT_BY = "path";
var C_DEFAULT_TEST_ID = "sr-000";
// -- E --
var C_ELEMENT_ID = "id";
var C_EMPTY_OPTION = "-1";
var C_EMPTY_STRING = "";
// -- L --
var C_LINK_TEXT = "link text";
// -- N --
var C_NEW_LINE = "\r\n";
// -- S --
var C_STATE_OBJECT_KEY = "state";
var C_STATE_SETTINGS_OBJECT_KEY = "settings";
//-- U --
var C_USER_INTERFACE = "ui";

// REPOSITORY: tags
// -- A --
var T_ACTION = "[action]";
// -- D --
var T_DESCRIPTION = "[description]";
// -- E --
var T_EXPECTED = "[expected]";
// -- I --
var T_ID = "\\[id\\]";
// -- L --
var T_LITERAL_EXAMPLE = "[literal_example]";
// #endregion

$(document).ready(() => {
    // server side - async calls and user interface population
    get(R_ACTIONS, (data) => {
        actionsHandler(data);

        get(R_CONNECTORS, (data) => {
            connectorsHandler(data)

            get(R_OPERATORS, (data) => {
                operatorsHandler(data);
                loadState();
                loadSettings();
            });
        });
    });

    // client side
    $(E_ACTIONS).change(helpHandler);
    $(E_IS_ELEMENT).change(helpHandler);
    $(E_RADIO_ALIAS).change(helpHandler);
    $(E_RADIO_QUERY_SELECTOR).change(helpHandler);
    $(E_RADIO_PATH).change(helpHandler);
    $(E_RADIO_PATH_ID).change(helpHandler);
});

// #region *** WIDGET: message event ***
// handle 'message' event when extension sends message
window.addEventListener("message", messageHandler, false);

/**
 * Summary. Populates widget user interface based on message from extension
 * @param {any} e Message event arguments
 */
function messageHandler(e) {
    if (e.data.from && e.data.from === "middleware" && e.data.action && e.data.action === "send") {
        sendTestCase(e.data.data);
        return;
    }

    if (e.data.from && e.data.from === "middleware" && e.data.action && e.data.action === "playback") {
        playback(e.data.data);
        return;
    }

    if (e.data.action && e.data.action === "toggle") {
        // debug
        console.log(e);

        $(E_WIDGET_TOGGLE).click();
        return;
    }

    // populate text elements
    $(E_TAG_NAME).html("&lt" + e.data.tag_name + "&gt");
    $(E_QUERY_SELECTOR).val(e.data.query_selector);
    $(E_PATH).val(e.data.path);
    $(E_PATH_ID).val(e.data.path_id);
    $(E_ATTRIBUTES_COUNT).html(count(e.data.attributes));
    $(E_ELEMENT_ID).val(e.data.element_id);
    $(E_LINK_TEXT).val(e.data.link_text);

    // generate attributes list
    var options = $(E_ATTRIBUTES);
    optionsHandler(options, e);

    // debug
    this.console.log(e);
}

/**
 * Summary. Clear & re-populate element's available attributes
 * 
 * @param {any} options Select element to populate into
 * @param {any} e       Message event arguments
 */
function optionsHandler(options, e) {
    // clear
    options.empty(); 
    options.append(new Option(C_EMPTY_STRING, -1));

    // create: all
    $.each(e.data.attributes, (_key, value) => {
        options.append(new Option(value, value));
    });
}
// #endregion

// #region *** WIDGET: get actions   ***
/**
 * Summary. Handles available action population when page loads
 * @param {any} data Data Object fetched from the server
 */
function actionsHandler(data) {
    // empty first line
    $(E_ACTIONS).append(new Option(C_EMPTY_STRING, -1));

    // actions
    for (var i = 0; i < data.length; i++) {
        var css = data[i].source === "code" ? "text-info" : "text-danger";
        var option = '<option class="' + css + '" value="' + data[i].key + '">' + data[i].literal + "</option>";
        $(E_ACTIONS).append(option);
    }
}
// #endregion

// #region *** WIDGET: get operator  ***
/**
 * Summary. Handles available operators population when page loads
 * @param {any} data Data Object fetched from the server
 */
function operatorsHandler(data) {
    populateSelect(data, E_OPERATORS, (response) => new Option(response, response));
}
// #endregion

// #region *** WIDGET: get connector ***
/**
 * Summary. Handles available connector population when page loads
 * @param {any} data Data Object fetched from the server
 */
function connectorsHandler(data) {
    populateSelect(data, E_connectorType, (response) => new Option(response.name, response.value));
}
// #endregion

// #region *** WIDGET: test scenario ***
/**
 * Summary. Handles available action population when page loads
 */
function scenarioHandler() {
    // get action from user interface
    var isAction = $(E_ACTIONS)[0].options.length !== 0 && $(E_ACTIONS).val() !== C_EMPTY_OPTION;
    var action = isAction ? $(E_ACTIONS).val() : C_EMPTY_OPTION;

    if (!isAction) {
        putExpected();
    }

    // get action from server & callback on success
    getAction(action, (actionLiteralModel) => {
        putAction(actionLiteralModel);
    });
}

function putAction(actionLiteralModel) {
    // get action > apply expected result > generate id
    var actions = getRhinoActions(actionLiteralModel, true);
    actions[0].expectedHtml = fromExpected(actionLiteralModel);
    var id = getActionId();

    // generate & append HTML
    var html = getActionRowHtml()
        .replaceAll(T_ID, id)
        .replace(T_ACTION, actions[0].html)
        .replace(T_EXPECTED, actions[0].expectedHtml);
    $(E_TEST_STEPS).append(html);

    // clear widget form
    saveState();
    clearWidget();

    // set number of steps
    refreshActionsNumber();
    putLiteral();
}

function getActionId() {
    // constants
    var Q = "div[id^='s']";

    // get max id +1
    var ids = [];
    $(Q).each((i, e) => {
        var a = e.id.match(/^s\d+$/);
        if (a !== null) {
            var str = a[0].match(/\d+/)[0];
            ids.push(Number(str));
        }        
    });
    if (ids.length === 0) {
        return 0;
    }
    return Math.max(...ids) + 1;
}

function getActionRowHtml() {
    return `
        <div id="a[id]" class="panel-group" style="margin-bottom: 3px;">
            <div class="panel panel-default">
                <div class="row bg-light">
                    <div class="panel-heading col-xs-6" style="margin-right: 10px;" >
                        <i id="u[id]" class="fa fa-arrow-up action-button action-button-generic" onclick="moveUp(this);"></i>
                        <i id="n[id]" class="fa fa-arrow-down action-button action-button-generic" onclick="moveDown(this);"></i>                    
                        <a data-toggle="collapse" href="#e[id]" style="text-decoration: none;"><i class="fa fa-flask action-button action-button-generic" aria-hidden="true"></i> </a>
                        <i id="d[id]" class="far fa-trash-alt action-button action-button-red" onclick="deleteAction(this);"></i>
                    </div>
                    <div id="s[id]" class="panel-heading bg-light col-xs-6 text-monospace small align-self-center">[action]</div>
                </div>
                <div class="row bg-light">
                    <div id="e[id]" class="panel-collapse collapse col-xs-6 text-monospace small align-self-center">[expected]</div>
                </div>
            </div>
        </div>
    `;
}

function putExpected() {
    // get last action
    var lastAction = $(E_TEST_STEPS).children().last();

    // get expected src
    var id = lastAction[0].id.replace("a", "e");
    var lastExpected = $("#" + id);
    var expectedHtml = fromExpected(null, true);

    // expected html > replace
    lastExpected.html(expectedHtml);

    // clear widget form
    saveState();
    clearWidget();
}

function putLiteral() {
    // get test script
    var testObj = getTestCaseObject();
    var testSrc = getTestCaseScript(testObj);

    var html = "";
    for (var i = 0; i < testSrc.length; i++) {
        html += "<span>" + testSrc[i] + "</span>"
        if (i !== testSrc.length - 1) {
            html += "<br/>"
        }
    }

    // populate
    $("#test_case_literal").empty();
    $("#test_case_literal").append(html);
}

// TODO: clean code!important
function fromExpected(actionLiteralModel) {
    // shortcuts
    var com = $(E_COMPONENTS).val();

    // exit conditions
    if (com === C_EMPTY_OPTION) {
        return C_EMPTY_STRING;
    }

    // parse expected result
    var parts = com.split("-");

    var locator = getLocatorData(actionLiteralModel, true);
    var locatorPhrase = locator.locator !== C_EMPTY_STRING
        ? getVerbSpan("using") + " {" + getArgumentSpan(locator.locator) + "}"
        : C_EMPTY_STRING;

    // compose phrase
    var pA = "verify that ";

    // boolean assertions
    if (parts.length === 2) {
        var pB = "{" + getArgumentSpan(parts[0]) + "}";
        var pC = " status ";
        var pD = getVerbSpan(" of ") + "{" + getArgumentSpan(locator.element) + "} " + locatorPhrase;
        var pE = " ";
        var pF = getVerbSpan("equal") + " {" + getArgumentSpan(parts[1]) + "}";
        return pA + pB + pC + pD + pE + pF;
    }

    // action assertions
    var e = pA;

    // validation: argument
    var argument = $(E_COMPONENTS).val();
    if (argument === C_EMPTY_OPTION) {
        return C_EMPTY_STRING;
    }

    // validation: operator
    var operator = $(E_OPERATORS).val();
    if (operator === C_EMPTY_OPTION) {
        return C_EMPTY_STRING;
    }

    // validation: expected value
    var expectedValue = $(E_EXPECTED_VALUE).val();
    if (expectedValue === C_EMPTY_STRING) {
        return C_EMPTY_STRING;
    }

    // property: argument
    e += argument.startsWith("{{") ? getArgumentSpan(argument) : "{" + getArgumentSpan(argument) + "}";

    // property: elementToActOn
    var elementSpan = locator.element.startsWith("{{")
        ? getArgumentSpan(locator.element)
        : "{" + getArgumentSpan(locator.element) + "}";
    e += locator.element !== C_EMPTY_STRING
        ? getVerbSpan(" of ") + elementSpan
        : C_EMPTY_STRING;

    // property: selector
    var locatorSpan = locator.locator.startsWith("{{")
        ? getArgumentSpan(locator.locator)
        : "{" + getArgumentSpan(locator.locator) + "}";
    e += locator.locator !== C_EMPTY_STRING
        ? getVerbSpan(" using ") + locatorSpan + " locator"
        : C_EMPTY_STRING;

    // property: regularExpression
    var regexValue = $(E_REGULAR_EXPRESSION).val();
    var regexSpan = regexValue.startsWith("{{") ? regexValue : " {" + regexValue + "}";
    e += $(E_REGULAR_EXPRESSION).val() !== C_EMPTY_STRING
        ? ", apply regex" + getVerbSpan(" filter") + regexSpan
        : C_EMPTY_STRING;

    // property: operator & expected value
    var expectedSpan = expectedValue.startsWith("{{")
        ? " " + getArgumentSpan(expectedValue)
        : " {" + getArgumentSpan(expectedValue) + "}";
    e += " " + getVerbSpan(operator) + expectedSpan;
    return e;
}

function clearWidget(includeSteps = false) {
    $("select:has(option[value=-1])").each((_, e) => {
        e.value = C_EMPTY_OPTION;
    });

    $("input[type='text']").not(E_gridEndpoint).not(E_TEST_CASE_TITLE).each((_, e) => {
        e.value = C_EMPTY_STRING;
    });

    $("textarea").each((_, e) => {
        e.value = C_EMPTY_STRING;
    });

    $(E_ATTRIBUTES).empty();
    $(E_RADIO_PATH).prop('checked', true);

    if (!includeSteps) {
        return;
    }
    $(E_TEST_CASE_TITLE).val("");
    $(E_TEST_STEPS).empty();
    $(E_STEPS_COUNT)[0].innerText = 0;
}

function deleteAction(e) {
    // remove parent action panel
    var query = "#" + e.id.replace("d", "a");
    $(query).remove();

    // save into session storage
    saveState();

    // refresh steps number
    refreshActionsNumber();
}

function refreshActionsNumber() {
    // set number of steps
    $(E_STEPS_COUNT)[0].innerText = $(E_TEST_STEPS)[0].children.length;
}

function moveUp(e) {
    // get query for this element
    var query = e.id.replace("u", "a");

    // get current element index
    var elements = $(E_TEST_STEPS).children();
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id === query) {
            index = i;
            break;
        }
    }

    // setup conditions
    var isOnly = $(E_TEST_STEPS)[0].children.length === 1;
    var isFirst = index === 0;

    // exit conditions
    if (isFirst || isOnly) {
        return;
    }

    // get elements for replacement
    elements[index - 1].before(elements[index]);
    saveState();
}

function moveDown(e) {
    // get query for this element
    var query = e.id.replace("n", "a");

    // get current element index
    var elements = $(E_TEST_STEPS).children();
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id === query) {
            index = i;
            break;
        }
    }

    // setup conditions
    var isOnly = $(E_TEST_STEPS)[0].children.length === 1;
    var isLast = ($(E_TEST_STEPS).children().length - 1) === index;

    // exit conditions
    if (isLast || isOnly) {
        return;
    }

    // get elements for replacement
    elements[index + 1].after(elements[index]);
    saveState();
}
// #endregion

// #region *** WIDGET: fetch help    ***
/**
 * Summary. Gets the help meta-data from back-end service based on selected action
 * @param {any} e Event handler arguments
 */
function helpHandler(e) {
    var action = e.target.options ? e.target.options[e.target.selectedIndex].value : $(E_ACTIONS).val();
    // exit conditions
    if (action === C_EMPTY_OPTION) {
        return;
    }
    var routing = R_ACTION + action;
    get(routing, (actionLiteralModel) => putHelp(actionLiteralModel));
}

function putHelp(actionLiteralModel) {
    // clear populated entries
    $(E_HELP_ROWS).empty();

    // collect new actions to populate
    var isElement = $(E_IS_ELEMENT)[0].checked;
    var actions = isElement
        ? getRhinoActions(actionLiteralModel, true)
        : getRhinoActions(actionLiteralModel);

    // setup metadata
    $(E_HELP_ACTION).text(actionLiteralModel.item2.literal);
    $(E_HELP_BADGE).text(actionLiteralModel.item2.key);
    $(E_HELP_DESCRIPTION).text(actionLiteralModel.item2.action.description);

    // populate new action
    for (var i = 0; i < actions.length; i++) {
        putHelpRow(actions[i], i);
    }
}

function putHelpRow(rhinoAction, id) {
    var htmlMultiple = `
        <div class="card bg-light">
            <div class="card-header" id="l[id]">
                <div class="panel-heading col-xs-6 text-monospace small align-self-center">
                    <a class="text-info pointer" data-toggle="collapse" data-target="#h[id]"><i class="far fa-question-circle" aria-hidden="true"></i> </a>[action]
                </div>
            </div>

            <div id="h[id]" class="collapse" aria-labelledby="l[id]" data-parent="#help_rows">
              <div class="card-body col-xs-6 small align-self-center">[description]</div>
            </div>
        </div>       
    `;


    var htmlSingle = `
        <div class="card bg-light">
            <div class="card-header" id="l[id]">
                <div class="panel-heading col-xs-6 text-monospace small align-self-center">
                    [action]
                </div>
            </div>
        </div>       
    `;

    var final = $(E_IS_ELEMENT)[0].checked ? htmlSingle : htmlMultiple;

    $(E_HELP_ROWS).append(final
        .replaceAll(T_ID, id)
        .replace(T_ACTION, rhinoAction.html)
        .replace(T_DESCRIPTION, rhinoAction.description));
}
// #endregion

// #region *** WIDGET: playback      ***
/**
 * Summary. Playback the current recorded test case against available Selenium Gird
 */
function actionPlaybackHandler() {
    var request = {
        from: C_USER_INTERFACE,
        route: "/api/getSettingsProxy",
        action: 'playback'
    }
    window.postMessage(request, "*");
}

function playback(stateObj) {
    console.log("Settings loaded.");

    // load temporary configuration
    var config = getConfiguration(stateObj);

    // parse test case script
    var testObj = getTestCaseObject();
    var testSrc = getTestCaseScript(testObj).join(C_NEW_LINE);
    config.testsRepository = [testSrc];

    // exit conditions
    if ($(E_PLAYBACK_PROGRESS).length) {
        console.log("Another playback is currently on progress, please wait until it finish and try again.");
        return;
    }

    // RUN PLAYBACK
    //-- toggle into test-case-scenario panel (if not already)
    var headerScenario = $(E_HEADER_SCENARIO);
    if (headerScenario.attr("aria-expanded") !== "true") {
        headerScenario.click();
    }

    //-- show async progress bar while playback is active
    showPlaybackProgress("Automation is currently running, this can take a while. Please wait...");

    //-- run async operation
    post(R_PLAYBACK, config, (testRun) => {
        console.log(testRun);
        publishTestRun(testRun);
        putLiteral();
    }, () => $(E_PLAYBACK_PROGRESS).remove());
}

function showPlaybackProgress(message) {
    var html = `
        <div id="playback_progress" class="alert alert-dismissible alert-info bring-to-front fixed-bottom">
            <h4 class="alert-heading">Information</h4>
            <p class="mb-0">[message]</p>
            <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
            </div>
        </div>
    `.replace("[message]", message);
    $(E_BODY).append(html);
}

function publishTestRun(testRun) {
    // reset user interface (if needed)
    $("#test_steps").find("svg.text-success").remove();
    $("#test_steps").find("svg.text-danger").remove();

    // apply to user interface
    $(E_TEST_STEPS + " > div").each((i, e) => {
        var step = $(e)
            .children("div > div:nth-child(1)")
            .children("div:nth-child(1)")
            .children("div:nth-child(1)");

        var icon = testRun.testCases[0].steps[i].actual
            ? '<i class="fa fa-check-circle text-success"></i>'
            : '<i class="fa fa-times-circle text-danger"></i>';
        step.append(icon);
    });

    // apply to local storage
    // TODO: add to widget
    try {
        localStorage.setItem("test-run", btoa(JSON.stringify(testRun)));
    } catch (e) {
        console.log(e);
    }
    saveState();
}
// #endregion

// #region *** WIDGET: send to ALM   ***
function sendHandler() {
    var request = {
        from: C_USER_INTERFACE,
        route: "/api/getSettingsProxy",
        action: 'send'
    }
    window.postMessage(request, "*");
}

function sendTestCase(stateObj) {
    // exit conditions
    var connectorType = stateObj.connectorOptions.connector;
    if (stateObj === null || connectorType === C_EMPTY_OPTION || connectorType === "connector_text") {
        putLiteral();
        sendAsString();
        return;
    }

    // parse test case script
    var testObj = getTestCaseObject();
    var spec = getTestCaseScript(testObj).join(C_NEW_LINE);
    var requestBody = {
        connector: stateObj.connectorOptions,
        entity: {
            testSuites: [
                stateObj.connectorOptions.testSuite
            ],
            spec: spec
        }
    };

    //-- show async progress bar while playback is active
    showPlaybackProgress("Creating test on target provider, Please wait...");

    //-- run async operation
    post(R_SEND, requestBody, (data) => {
        console.log(data);
    }, () => $(E_PLAYBACK_PROGRESS).remove());
}

function sendAsString() {
    // parse test case script
    var testObj = getTestCaseObject();
    var testSrc = getTestCaseScript(testObj).join(C_NEW_LINE);
    console.log(testSrc);
}
// #endregion

// #region *** WIDGET: state manager ***
/**
 * Summary. Loads the last saved state from local storage.
 */
function loadState() {
    var stateObj = getObjectFromStorage(C_STATE_OBJECT_KEY);

    // apply last state
    loadTestScenario(stateObj);
}

/**
 * Summary. Loads the last saved settings state from local storage.
 */
function loadSettings() {
    if (!location.href.toLowerCase().endsWith("/settings")) {
        return;
    }

    // deserialize last state
    var requestBody = { type: "getSettings" };

    // get
    chrome.runtime.sendMessage(R_EXTENSION_ID, requestBody, function (stateObj) {
        console.log("Settings loaded.");
        loadAllSettings(stateObj);
    });
}

function loadAllSettings(stateObj) {
    // connector options
    $(E_connectorType).val(stateObj.connectorOptions.connectorType);
    $(E_SERVER_ADDRESS).val(stateObj.connectorOptions.serverAddress);
    $(E_PROJECT).val(stateObj.connectorOptions.project);
    $(E_testSuite).val(stateObj.connectorOptions.testSuite);
    $(E_USER_NAME).val(stateObj.connectorOptions.userName);
    $(E_PASSWORD).val(stateObj.connectorOptions.password);
    $(E_CONNECTOR_CAPABILITIES).val(stateObj.connectorOptions.capabilities);

    // playback options
    $(E_webDriver).val(stateObj.playbackOptions.webDriver);
    $(E_gridEndpoint).val(stateObj.playbackOptions.gridEndpoint);
    $(E_DRIVER_CAPABILITIES).val(stateObj.playbackOptions.capabilities);
    $(E_DRIVER_OPTIONS).val(stateObj.playbackOptions.options);

    // rhino options
    $(E_USER_NAME).val(stateObj.rhinoOptions.userName);
    $(E_PASSWORD).val(stateObj.rhinoOptions.password);
}

function loadTestScenario(stateObj) {
    if (stateObj === null) {
        return;
    }
    $(E_TEST_CASE_TITLE).val(stateObj.test_case_scenario.test_case_title);
    $(E_STEPS_COUNT).text(stateObj.test_case_scenario.steps_count);
    $(E_TEST_STEPS).html(stateObj.test_case_scenario.test_steps);
}

/**
 * Summary. Saves this widget state into local storage.
 */
function saveState() {
    var stateObj = {
        test_case_scenario: getTestScenarioState()
    };

    var stateStr = JSON.stringify(stateObj);
    localStorage.setItem(C_STATE_OBJECT_KEY, stateStr);    
}

/**
 * Summary. Saves this widget settings state into local storage.
 */
function saveSettings() {
    var stateObj = {
        playbackOptions: getPlaybackOptionsState(),
        connectorOptions: getConnectorOptions(),
        rhinoOptions: getRhinoOptions()
    };

    // save to local storage
    var stateStr = JSON.stringify(stateObj);
    localStorage.setItem(C_STATE_SETTINGS_OBJECT_KEY, stateStr);

    // save to background storage
    sendSettings(stateObj);
}

function getPlaybackOptionsState() {
    return {
        webDriver: $(E_webDriver + " option").length > 0 ? $(E_webDriver + " option:selected").val() : C_EMPTY_OPTION,
        gridEndpoint: $(E_gridEndpoint).val(),
        capabilities: $(E_DRIVER_CAPABILITIES).val(),
        options: $(E_DRIVER_OPTIONS).val()
    };
}

function getTestScenarioState() {
    return {
        test_case_title: $(E_TEST_CASE_TITLE).val(),
        steps_count: $(E_TEST_STEPS)[0].children.length,
        test_steps: $(E_TEST_STEPS).html()
    };
}

function getConnectorOptions() {
    // shortcuts
    var con_tp = $(E_connectorType + " option").length > 0
        ? $(E_connectorType + " option:selected").val()
        : C_EMPTY_OPTION;

    // setup state object
    return {
        connectorType: con_tp,
        serverAddress: $(E_SERVER_ADDRESS).val(),
        project: $(E_PROJECT).val(),
        testSuite: $(E_testSuite).val(),
        userName: $(E_USER_NAME).val(),
        password: $(E_PASSWORD).val(),
        capabilities: $(E_CONNECTOR_CAPABILITIES).val()
    };
}

function getRhinoOptions() {
    return {
        userName: $(E_USER_NAME).val(),
        password: $(E_PASSWORD).val()
    };
}
// #endregion

// #region *** WIDGET: action parser ***
/**
 * Summary. Gets a RhinoActions object collection based on ActionLiteralModel examples.
 * 
 * @param {any} actionLiteralModel Model by which to compose RhinoAction
 * @param {any}               isUi Set to true will fetch ActionRules value from widget user interface
 * 
 * @return {any} New string after replacements.
 */
function getRhinoActions(actionLiteralModel, isUi = false) {
    var rhinoActions = [];

    // TODO: handle non-standard actions
    if (isNullOrEmpty(actionLiteralModel.item2.action.examples)) {
        var rhinoAction = {
            actionPlugin: actionLiteralModel.item2.key,
            actionLiteral: actionLiteralModel.item2.literal,
            verb: actionLiteralModel.item2.verb,
            actionRule: C_EMPTY_STRING,
            description: C_EMPTY_STRING,
            id: 0
        };

        rhinoAction.html = getRhinoActionHtml(rhinoAction, isUi);
        rhinoActions.push(rhinoAction);
        return rhinoActions;
    }

    $(actionLiteralModel.item2.action.examples).each((i, e) => {
        rhinoAction = {
            actionPlugin: actionLiteralModel.item2.key,
            actionLiteral: actionLiteralModel.item2.literal,
            verb: actionLiteralModel.item2.verb,
            actionRule: e.actionExample,
            description: e.description,
            id: i
        };
        rhinoAction.html = getRhinoActionHtml(rhinoAction, isUi);
        rhinoActions.push(rhinoAction);
    });
    return isUi ? [rhinoActions[0]] : rhinoActions;
}

function getRhinoActionHtml(rhinoAction, isUi) {
    // initialize > apply literal
    var html = getActionSpan(rhinoAction.actionLiteral);

    // apply locator > elementToActOn
    var locatorData = getLocatorData(rhinoAction, isUi);
    rhinoAction.actionRule.locator = locatorData.locator;
    rhinoAction.actionRule.elementToActOn = locatorData.element;

    // apply argument > element > locator > attribute > regex
    html += getArgumentHtml(rhinoAction, isUi);
    html += getElementToActOnHtml(rhinoAction);
    html += getLocatorHtml(rhinoAction);
    html += getElementAttributeToActOnHtml(rhinoAction, isUi);
    html += getRegularExpressionHtml(rhinoAction, isUi);

    // complete
    return html;
}

function getLocatorData(rhinoAction, isUi) {
    // setup conditions
    var isAlias = $(E_RADIO_ALIAS)[0].checked;
    var isQuerySelector = $(E_RADIO_QUERY_SELECTOR)[0].checked;
    var isFullPath = $(E_RADIO_PATH)[0].checked;
    var isPath = $(E_RADIO_PATH_ID)[0].checked;
    var isElementId = $(E_RADIO_ELEMENT_ID)[0].checked;
    var isLinkText = $(E_RADIO_LINK_TEXT)[0].checked;
    var isAccessibility = $(E_RADIO_ACCESSIBILITY)[0].checked;

    // take from action-rule
    if (!isUi) {
        return {
            locator: rhinoAction.actionRule.locator,
            element: rhinoAction.actionRule.elementToActOn
        };
    }

    // take from user interface
    var data = {};
    if (isAlias) {
        data.locator = C_EMPTY_STRING;
        data.element = $(E_ALIAS).val();
    }
    if (isQuerySelector) {
        data.locator = C_CSS_SELECTOR;
        data.element = $(E_QUERY_SELECTOR).val();
    }
    if (isFullPath) {
        data.locator = C_EMPTY_STRING;
        data.element = $(E_PATH).val();
    }
    if (isPath) {
        data.locator = C_EMPTY_STRING;
        data.element = $(E_PATH_ID).val();
    }
    if (isElementId) {
        data.locator = C_ELEMENT_ID;
        data.element = $(E_ELEMENT_ID).val();
    }
    if (isLinkText) {
        data.locator = C_LINK_TEXT;
        data.element = $(E_LINK_TEXT).val();
    }
    if (isAccessibility) {
        data.locator = C_ACCESSIBILITY;
        data.element = $(E_ACCESSIBILITY).val();
    }
    return data;
}

function getArgumentHtml(rhinoAction, isUi) {
    // get argument value
    var argument = isUi ? $(E_ARGUMENT).val() : rhinoAction.actionRule.argument;

    if (isNullOrEmpty(argument)) {
        return C_EMPTY_STRING;
    }

    if (argument.startsWith("{{")) {
        return " " + getArgumentSpan(argument);
    }

    return argument === C_EMPTY_STRING
        ? C_EMPTY_STRING
        : " {" + getArgumentSpan(argument) + "}";
}

function getElementToActOnHtml(rhinoAction) {
    if (isNullOrEmpty(rhinoAction.actionRule.elementToActOn)) {
        return C_EMPTY_STRING;
    }

    if (rhinoAction.actionRule.elementToActOn.startsWith("{{")) {
        return " " + getVerbSpan(rhinoAction.verb) + " " + getArgumentSpan(rhinoAction.actionRule.elementToActOn)
    }

    return rhinoAction.actionRule.elementToActOn !== C_EMPTY_STRING
        ? " " + getVerbSpan(rhinoAction.verb) + " " + "{" + getArgumentSpan(rhinoAction.actionRule.elementToActOn) + "}"
        : C_EMPTY_STRING;
}

function getLocatorHtml(rhinoAction) {
    // setup conditions
    var isElement = rhinoAction.actionRule.elementToActOn !== C_EMPTY_STRING;
    var isLocator = isElement && rhinoAction.actionRule.locator !== C_EMPTY_STRING;

    // compose
    return isLocator
        ? getVerbSpan(" using ") + "{" + getArgumentSpan(rhinoAction.actionRule.locator) + "}"
        : C_EMPTY_STRING;
}

function getElementAttributeToActOnHtml(rhinoAction, isUi) {
    // setup
    var attribute = C_EMPTY_STRING;

    // take from action-rule
    if (!isUi) {
        attribute = rhinoAction.actionRule.elementAttributeToActOn !== C_EMPTY_STRING
            ? rhinoAction.actionRule.elementAttributeToActOn
            : C_EMPTY_STRING;
    }
    else if (isUi) {
        attribute = $(E_ATTRIBUTES)[0].options.length !== 0 && $(E_ATTRIBUTES).val() !== C_EMPTY_OPTION
            ? $(E_ATTRIBUTES).val()
            : C_EMPTY_STRING;
    }

    // take from user interface
    return attribute !== C_EMPTY_STRING
        ? getVerbSpan(" from") + " attribute" + " {" + getArgumentSpan(attribute) + "}"
        : C_EMPTY_STRING;
}

function getRegularExpressionHtml(rhinoAction, isUi) {
    // setup
    var regex = C_EMPTY_STRING;

    // take from action-rule
    if (!isUi && rhinoAction.actionRule.regularExpression !== ".*") {
        regex = rhinoAction.actionRule.regularExpression;
    }
    // take from user interface
    if (isUi && $(E_REGULAR_EXPRESSION).val() !== C_EMPTY_STRING && $(E_REGULAR_EXPRESSION).val() !== ".*") {
        regex = $(E_REGULAR_EXPRESSION).val();
    }

    // compose
    return regex !== C_EMPTY_STRING
        ? " apply regex" + getVerbSpan(" filter") + " {" + getArgumentSpan(regex) + "}"
        : C_EMPTY_STRING;
}

// styles
function getVerbSpan(verb) {
    return '<span class="verb">' + verb + '</span>';
}

function getArgumentSpan(argument) {
    return '<span class="argument">' + argument + '</span>';
}

function getActionSpan(action) {
    return '<span class="keyword">' + action + '</span>';
}
// #endregion

// UTILITIES
function getConfiguration(settings) {
    // exit conditions
    if (settings === null) {
        console.error("Was not able to load playback settings. " +
            "Please make sure you have configured and saved settings for this domain (under Rhino Settings page).");
        return;
    }

    // normalize
    settings.playbackOptions.capabilities = settings.playbackOptions.capabilities === ""
        ? '{}'
        : settings.playbackOptions.capabilities

    settings.playbackOptions.options = settings.playbackOptions.capabilities === ""
        ? '{}'
        : settings.playbackOptions.options

    // setup conditions
    var driver_parameters = [
        {
            driver: settings.playbackOptions.webDriver,
            driverBinaries: settings.playbackOptions.gridEndpoint
        }
    ];

    // capabilities
    for (var i = 0; i < driver_parameters.length; i++) {
        driver_parameters[i].capabilities = JSON.parse(settings.playbackOptions.capabilities);
        var stateObj = getObjectFromStorage(C_STATE_OBJECT_KEY);
        if (stateObj !== null && typeof stateObj !== 'undefined') {
            driver_parameters[i].capabilities.name = stateObj.test_case_scenario.test_case_title;
        }
        driver_parameters[i].capabilities.build = "Rhino Widget: " + new Date().toISOString().substring(0, 10);
        driver_parameters[i].capabilities.project = "Rhino Actions Recorder";

        // options
        driver_parameters[i].options = JSON.parse(settings.playbackOptions.options);
    }

    return {
        engineConfiguration: {
            errorOnExitCode: 10
        },
        authentication: {
            userName: settings.rhinoOptions.userName,
            password: settings.rhinoOptions.password
        },
        driverParameters: driver_parameters,
        //unattached: true,
        name: C_CONFIGURATION_NAME
    };
}

/**
 * Summary. Executes a get request to fetch an action from the server with onSuccess callback.
 * 
 * @param {any} action    The action name to fetch from the server
 * @param {any} onSuccess Success callback action
 */
function getAction(action, onSuccess) {
    // exit conditions
    if (action === C_EMPTY_OPTION) {
        return;
    }

    // get action
    var routing = R_ACTION + action;
    get(routing, onSuccess);
}

/**
 * Summary. Executes a get request with onSuccess callback
 * 
 * @param {any} routing   Endpoint to which send the request
 * @param {any} onSuccess Success callback action
 */
function get(routing, onSuccess) {
    $.ajax({
        url: routing,
        type: "GET",
        dataType: "json",

        success: (data) => {
            onSuccess(data);
        },
        error: (e) => {
            console.log(e);
            console.log("Error while calling the Web API on [" + routing + "]");
        }
    });
}

/**
 * Summary. Executes a post request with onSuccess callback
 * 
 * @param {any} routing   Endpoint to which send the request
 * @param {any} data      Data Object to pass with this request as body
 * @param {any} onSuccess Success callback action
 * @param {any} onAlways  Finalize callback action, will always be executed
 */
function post(routing, data, onSuccess, onAlways) {
    // elevate properties
    //data.config.driverCapabilities = data.config.driverParameters.capabilities;
    //data.config.driverOptions = data.config.driverParameters.options;

    // send
    $.ajax({
        url: routing,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),

        success: (data) => {
            onSuccess(data);
        },
        error: (e) => {
            console.log(e);
            console.log("Error while calling the Web API on [" + routing + "]");
        }
    }).always(onAlways);
}

/**
 * Summary. Populates a select element, based on key/value data fetched from controller
 * 
 * @param {any} data     Data Object received from controller
 * @param {any} selector Query selector to find this element
 * @param {any} populate Delegate to implement the population by value (must return Option element)
 */
function populateSelect(data, selector, populate) {
    // shortcuts
    var select = $(selector);
    select.attr("disabled", true);

    // setup
    select.empty();
    select.append(new Option(C_EMPTY_STRING, -1));

    // iterate
    $.each(data, (_key, value) => {
        select.append(populate(value.literal));
    });

    // setup
    select.attr("disabled", false);
}

/**
 * Summary. Gets test case literal script (rows)
 * 
 * @param   {any} obj Test case object by which to generate literal script
 * @returns {any}     Test case literal script (rows)
 */
function getTestCaseScript(obj) {
    // initialize test case script container
    var testCase = [];
    var expected = [];

    // setup - test actions
    testCase.push("[test-id] " + obj.id);
    testCase.push("[test-scenario] " + obj.scenario);
    testCase.push(C_EMPTY_STRING);
    testCase.push("[test-actions]");

    // setup - expected results
    expected.push(C_EMPTY_STRING);
    expected.push("[test-expected-results]");

    // populate
    var maxIndent = obj.actions.length.toString().length;
    for (var i = 0; i < obj.actions.length; i++) {
        // test action
        var indent = maxIndent - (i + 1).toString().length + 1;
        var space = "";
        for (var j = 1; j < indent + 1; j++) {
            space = space + " ";
        }
        testCase.push((i + 1).toString() + "." + space + obj.actions[i].step);

        // expected result
        if (obj.actions[i].expected !== C_EMPTY_STRING) {
            expected.push("[" + (i + 1) + "] " + obj.actions[i].expected);
        }
    }
    return expected.length > 2 ? Array.prototype.concat(testCase, expected) : testCase;
}

/**
 * Summary. Gets test case object (raw)
 * 
 * @returns {any} Test case object (raw)
 */
function getTestCaseObject() {
    // initialize test case script container
    var testCase = {};

    // fields
    testCase.id = C_DEFAULT_TEST_ID;
    testCase.scenario = $(E_TEST_CASE_TITLE).val();

    // fields: actions
    testCase.actions = [];
    $(E_TEST_STEPS + " > div").each((i, e) => {
        var step = $(e)
            .children("div > div:nth-child(1)")
            .children("div:nth-child(1)")
            .children("div:nth-child(2)")
            .text()
            .trim();

        var expected = $(e)
            .children("div > div:nth-child(1)")
            .children("div:nth-child(2)")
            .text()
            .trim();

        testCase.actions.push({ step: step, expected: expected });
    });
    return testCase;
}

function showErrorAlert(message) {
    // html script
    var html = `
        <div class="alert alert-dismissible alert-danger bring-to-front fixed-bottom">
            <button type="button" class="close" data-dismiss="alert" onclick="dismissErrorAlert(this);">&times;</button>
            <h4 class="alert-heading">Error</h4>
            <p class="mb-0">[message]</p>
            <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
            </div>
        </div>
    `;

    // append error alert
    var htmlNode = $.parseHTML(html.replace("[message]", message));
    $(E_BODY).append(htmlNode);

    // return last added alert
    return htmlObj;
}

function dismissErrorAlert(htmlNode) {
    $(htmlNode).parent().remove();
}

/**
 * Summary. Sends settings to background script for extension use
 *
 * @param   {any} obj Settings object
 */
function sendSettings(stateObj) {
    // setup
    var requestBody = { type: "putSettings", data: stateObj };

    chrome.runtime.sendMessage(R_EXTENSION_ID, requestBody, function () {
        console.log("Settings saved.");
    });
}

/**
 * Gets an object from local storage.
 * 
 * @param  {any} key The key under which this object is stored.
 * @return {any} Objected retrieved from local storage.
 */
function getObjectFromStorage(key) {
    // get state object
    var jsonStr = localStorage.getItem(key);

    // exit conditions
    if (jsonStr === null) {
        return null;
    }

    // deserialize last state
    return JSON.parse(jsonStr);
}

/**
 * Counts items in a collection.
 *
 * @param  {any} array The array of which to count items.
 * @return {any} Total items in the array.
 */
function count(array) {
    try {
        var total = 0;
        for (i in array) {
            if (array[i] !== undefined) { total++; }
        }
        return total;

    } catch (e) {
        console.error(e);
        return -1;
    }
}

/**
 * Indicates whether the specified object is null or an empty string ("").
 * 
 * @param {any} obj object to evaluate.
 *
 * @returns {boolean}  true if the value parameter is null or an empty string (""); otherwise, false.
 */
function isNullOrEmpty(obj) {
    // setup conditions
    var isDefined = typeof (obj) !== 'undefined';
    var isNotNull = isDefined && obj !== null;
    var isNotEmpty = Array.isArray(obj) ? obj.length > 0 : obj !== '';

    // get
    return !isDefined || !isNotNull || !isNotEmpty;
}

// EXTENSIONS
/**
 * Summary. Converts a camel case string into sentence case string.
 * 
 * @return {String} Sentence case string.
 */
String.prototype.pascalToSpaceCase = () => {
    var result = this.replace(new Regex("(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])", "g"), " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Summary. Replace all matches with new string.
 * @param {any} search      Match to find by.
 * @param {any} replacement New string to replace by.
 * 
 * @return {String} New string after replacements.
 */
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};