var extra_args={};function CSESetExtraArgs(e){extra_args=e}function CSEGetExtraArgs(){return extra_args}function getParameterByName(e){var a=window.location.href;e=e.replace(/[\[\]]/g,"\\$&");var t=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(a);return t?t[2]?decodeURIComponent(t[2].replace(/\+/g," ")):"":null}function createSearchRefinementsTabs(r){var e=$("<div></div>").addClass("searchOption-tabs"),n=$("<ul></ul>").addClass("nav nav-tabs");return e.append(n),$.each(r.all_refinements,function(e,a){var t=$("<li></li>");void 0===r.refinement&&""===a.value?t.addClass("active"):r.refinement==a.value&&t.addClass("active"),t.append($("<a></a>").attr("href","#").html(a.label).on("click",function(e){CSEPerformSearch(r.page,a.value),e.preventDefault()})),n.append(t)}),e}function createSuggestions(a){var e="";return void 0!==a.results.spelling&&(e=$("<div></div>").attr("id","api-url").append($("<span></span>").html("You searched for "+a.query+". Did you mean ")).append($("<a></a>").attr("href","#").html(a.results.spelling.htmlCorrectedQuery).on("click",function(e){$("div.csesearch input#q").val(a.results.spelling.correctedQuery),CSEPerformSearch(a.page),e.preventDefault()}))),e}function createSearchBar(e){var a=$("<div></div>").attr("id","searchbar").addClass("row"),t=$("<div></div>").addClass("col-md-12");return a.append(t),t.append($("<b></b>").html("Search Results")),t.append($("<span></span>").html(" Results ").append($("<b></b>").html(e.start)).append($("<span></span>").html(" - ")).append($("<b></b>").html(e.end)).append($("<span></span>").html(" for ")).append($("<b></b>").html(e.query))),t.append($("<hr/>")),a}function createPromotionsSection(e){var n="";return void 0!==e.results.promotions&&(n=$("<div></div>").addClass("results promotions"),$.each(e.results.promotions,function(e,a){var t=$("<div></div>").addClass("row"),r=$("<div></div>").addClass("col-sm-12 results-details").append($("<a></a>").attr("href",a.link).append($("<span></span>").addClass("l").html(a.htmlTitle))).append($("<br/>")).append($("<span></span>").addClass("search-results-snippet").html(void 0!==a.bodyLines?a.bodyLines[0].htmlTitle:"")).append($("<br/>")).append($("<span></span>").addClass("results-url").html(a.link)).append($("<br/>"));t.append(r),n.append(t)})),n}function createResultsSection(e){var n=$("<div></div>").addClass("results");return $.each(e.results.items,function(e,a){var t=$("<div></div>").addClass("row"),r=$("<div></div>").addClass("col-sm-12 results-details").append($("<a></a>").attr("href",a.link).append($("<b></b>").html(a.htmlTitle))).append($("<br/>")).append($("<span></span>").addClass("search-results-snippet").html(a.htmlSnippet)).append($("<br/>")).append($("<span></span>").addClass("results-url").html(a.link));t.append(r),n.append(t)}),n}function createPagination(r){var e="";if(r.show_pagination){e=$("<div></div>").addClass("listingBar");var n=$("<ul></ul>").addClass("pagination");if(e.append(n),void 0!==r.previous){var a=$("<li></li>").addClass("previous").append($("<a></a>").attr("href","#").html(" Previous 10 items ").on("click",function(e){CSEPerformSearch(r.previous,r.refinement),e.preventDefault()}));n.append(a)}if(void 0!==r.next){var t=$("<li></li>").addClass("next").append($("<a></a>").attr("href","#").html(" Next 10 items ").on("click",function(e){CSEPerformSearch(r.next,r.refinement),e.preventDefault()}));n.append(t)}$.each(r.previous_pages,function(e,a){var t=$("<li></li>").append($("<a></a>").attr("href","#").html(a).on("click",function(e){CSEPerformSearch(a,r.refinement),e.preventDefault()}));n.append(t)});var s=$("<li></li>").addClass("active").append($("<a></a>").attr("href","#").html(r.page).on("click",function(e){e.preventDefault()}));n.append(s);var l=!0;if($.each(r.next_pages,function(e,a){void 0!==r.last_page&&a==r.last_page&&(l=!1);var t=$("<li></li>").append($("<a></a>").attr("href","#").html(a).on("click",function(e){CSEPerformSearch(a,r.refinement),e.preventDefault()}));n.append(t)}),l&&void 0!==r.last_page&&r.last_page!==r.page){var i=$("<li></li>").append($("<a></a>").attr("href","#").html("...").on("click",function(e){e.preventDefault()})).append($("<a></a>").attr("href","#").html(r.last_page).on("click",function(e){CSEPerformSearch(r.last_page,r.refinement),e.preventDefault()}));n.append(i)}}return e}function populateSearchResults(e){var a=$("div#cse-search-results");a.html(""),""==e.query?a.append($("<div></div>").addClass("results").html("Please enter something to search for.")):0==e.total?a.append($("<div></div>").addClass("results").html("No results found.")):(a.append(createSearchRefinementsTabs(e)),a.append(createSuggestions(e)),a.append(createSearchBar(e)),e.show_promotions&&a.append(createPromotionsSection(e)),a.append(createResultsSection(e)),a.append(createPagination(e)))}function CSEPerformSearch(a,t){var e=$("div.csesearch input#q").val(),r=$("div.csesearch select#sort_by");r.off("change").on("change",function(e){CSEPerformSearch(a,t)});var n=r.val();a||(a=1),t||(t="");var s=CSEGetExtraArgs(),l="@@csesearchresults";void 0!==portal_url&&(l=portal_url+"/@@csesearchresults"),$.ajax({url:l,data:{q:e,sort_by:n,page:a,refinement:t,extra_args:JSON.stringify(s)}}).done(function(e){populateSearchResults(e)})}$(function(){if(console.log("collective.cse ready!"),0!=$("div.csesearch input#q").length){var e=getParameterByName("q");$("div.csesearch input#q").val(e),$("div.csesearch form#cse-search-form").on("submit",function(e){CSESetExtraArgs({}),CSEPerformSearch(),e.preventDefault()}),CSEPerformSearch()}}),define("/trabajo/collective/collective.cse/src/collective/cse/static/js/cse.js",function(){});
//# sourceMappingURL=cse-compiled.js.map