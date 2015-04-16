/// <reference path="~/app/utils/system/system-ns.js"/>

system.string = (function () {
    var titleCaseRgx = /([a-z])([A-Z])/g;
    var separatorRgx = /([_ ]+)([a-z])/gi;
    var numericRgx = /^[-]?\d*\.?\d*$/g;
    var slice = Array.prototype.slice;

    function indexOf(source, pattern, caseSensitive) {
        // check for null/undefined but allow 0
        if (source == null || source === "" || pattern == null || pattern === "") {
            return -1;
        }

        if (typeof source !== "string") {
            source = String(source);
        }

        if (typeof pattern !== "string") {
            pattern = String(pattern);
        }

        if (pattern.length > source.length) {
            return -1;
        }

        if (!caseSensitive) {
            source = source.toLowerCase();
            pattern = pattern.toLowerCase();
        }

        if (source === pattern) {
            return 0;
        }

        return source.indexOf(pattern);
    }

    return {
        toTitleCase: function (text) {
            /// <summary>Converts a string from camelcase to titlecase with spaces between detected breaks.</summary>
            /// <param name="text">The text to convert.</param>
            /// <returns type="String">The converted text.</returns>

            if (text && text.length > 1) {
                return text.charAt(0).toUpperCase() + text.substr(1).replace(titleCaseRgx, "$1 $2")
                  .replace(separatorRgx, function ($0, $1, $2) {
                      return " " + $2.toUpperCase();
                  });
            }

            return text;
        },

        capitalize: function (text) {
            /// <summary>Capitalized the provided string.</summary>
            /// <param name="text">The text to capitalize.</param>
            /// <returns type="String">The capitalized string.</returns>

            if (!text) {
                return text;
            }

            if (text.length === 1) {
                return text.toUpperCase();
            }

            return text.charAt(0).toUpperCase() + text.substr(1);
        },

        startsWith: function (source, pattern, caseSensitive) {
            /// <summary>Determines whether a string starts with the matching text.</summary>
            /// <param name="source">The string to search through.</param>
            /// <param name="pattern">The string to match with.</param>
            /// <param name="caseSensitive">Indicates whether the match is case sensitive or not. OPTIONAL - (Default is false)</param>
            /// <returns type="Boolean">True if matches; false otherwise.</returns>

            return indexOf(source, pattern, caseSensitive) === 0;
        },

        contains: function (source, pattern, caseSensitive) {
            /// <summary>Determines whether a string contains the matching text.</summary>
            /// <param name="source">The string to search through.</param>
            /// <param name="pattern">The string to match with.</param>
            /// <param name="caseSensitive">Indicates whether the match is case sensitive or not. OPTIONAL - (Default is false)</param>
            /// <returns type="Boolean">True if matches; false otherwise.</returns>

            return indexOf(source, pattern, caseSensitive) >= 0;
        },

        format: function (text /*, args */) {
            /// <summary>
            /// Formats a string, replacing tokens from within the string with the arguments supplied. 
            /// Note that this function auto-detects whether the string is using a 1-based or 0-based 
            /// sequence based on the tokens contained within the string.
            /// </summary>
            /// <param name="text">The text to be updated.</param>
            /// <param name="args">You can use a single array of tokens or pass in a variable number of arguments</param>
            /// <returns type="String">The updated string.</returns>

            if (!text || arguments.length < 2) {
                return text;
            }

            var tokens, offset, i, rgx;
            if (arguments.length === 2 && Array.isArray(arguments[1])) {
                // be forgiving if the dev passes in an array of tokens 
                // instead of using multiple arguments
                // that might even be more convient sometimes
                tokens = arguments[1];
            }
            else {
                tokens = slice.call(arguments, 1);
            }

            // figure out if the string is 1 based or 0 based
            offset = /\{0\}/.test(text) ? 0 : 1;

            i = tokens.length;
            while (i--) {
                rgx = new RegExp("\\{" + (i + offset) + "\\}", "g");
                text = text.replace(rgx, (tokens[i] == null) ? "" : tokens[i]);
            }

            return text;
        },

        escapeHtml: function (text) {
            /// <summary>Escapes the provided text for use within HTML.</summary>
            /// <param name="text">The text to escape.</param>
            /// <returns type="String">The escaped string.</returns>

            return text.replace(/&/g, '&amp;')
              .replace(/>/g, '&gt;')
              .replace(/</g, '&lt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
        },

        repeat: function (count, text) {
            /// <summary>Repeats the provided string the number of times specified.</summary>
            /// <param name="count">The number of times to repeat the string.</param>
            /// <param name="text">The string to repeat.</param>
            /// <returns type="String">The repeated text.</returns>

            return Array(count + 1).join(text);
        },

        isNumeric: function (text) {
            /// <summary>Determines if the string is numeric.</summary>
            /// <param name="text">The string.</param>
            /// <returns type="Boolean">True, if the string is numeric; otherwise false.</returns>

            if (!text) {
                return false;
            }

            return text.toString().match(numericRgx);
        }
    };
})();