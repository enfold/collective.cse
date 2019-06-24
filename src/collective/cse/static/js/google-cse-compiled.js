// This is not implemented as a pattern because this can be used on a Plone 4 or Plone 5
var extra_args = {};

function CSESetExtraArgs(args){
    extra_args = args;
}

function CSEGetExtraArgs(){
    return extra_args;
}

function getParameterByName(name) {
    // Helper to get value from parameter
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function createSearchRefinementsTabs(data){
    var div = $("<div></div>")
                     .addClass("searchOption-tabs");
    var nav_refinements = $("<ul></ul>")
                          .addClass("nav nav-tabs");
    div.append(nav_refinements);
    $.each( data.all_refinements, function( key, value ) {
      var nav_item = $("<li></li>");
      if (data.refinement === undefined && value.value === "") {
        // Mark the "All" selected
        nav_item.addClass('active');
      }
      else if (data.refinement == value.value) {
        nav_item.addClass('active');
      }
      nav_item.append(
        $("<a></a>")
        .attr('href', '#')
        .html(value.label)
        .on('click', function (event){
          CSEPerformSearch( data.page, value.value );
          event.preventDefault();
        })
      );
      nav_refinements.append(nav_item);
    });

    return div
}

function createSuggestions(data){
  var div = "";
  if (data.results.spelling !== undefined){
    div = $("<div></div>")
          .attr('id', "api-url")
          .append($("<span></span>").html("You searched for " + data.query + ". Did you mean "))
          .append($("<a></a>")
                  .attr('href', '#')
                  .html(data.results.spelling.htmlCorrectedQuery)
                  .on('click', function (event){
                    $('div.csesearch input#q').val(data.results.spelling.correctedQuery);
                    CSEPerformSearch( data.page );
                    event.preventDefault();
                  }))
  }
  return div
}

function createSearchBar(data){
  var div = $("<div></div>")
            .attr('id', 'searchbar')
            .addClass('row');
  var inner_div = $("<div></div>")
                  .addClass('col-md-12');
  div.append(inner_div);
  inner_div.append($("<b></b>").html("Search Results"));
  inner_div.append($("<span></span>").html(" Results ")
                   .append($("<b></b>").html(data.start))
                   .append($("<span></span>").html(" - "))
                   .append($("<b></b>").html(data.end))
                   .append($("<span></span>").html(" for "))
                   .append($("<b></b>").html(data.query)));
  inner_div.append($("<hr/>"));
  return div
}

function createPromotionsSection(data){
  var div = "";
  if (data.results.promotions !== undefined){
    div = $("<div></div>")
          .addClass("results promotions");

    $.each( data.results.promotions, function( key, value ) {
      var row_item = $("<div></div>")
                     .addClass("row");
      var link = $("<div></div>")
                 .addClass("col-sm-12 results-details")
                 .append($("<a></a>")
                         .attr('href', value.link)
                         .append($("<span></span>")
                                 .addClass("l")
                                 .html(value.htmlTitle)
                         )
                 )
                 .append($("<br/>"))
                 .append($("<span></span>")
                         .addClass("search-results-snippet")
                         .html(value.bodyLines !== undefined ? value.bodyLines[0].htmlTitle : "")
                 )
                 .append($("<br/>"))
                 .append($("<span></span>")
                         .addClass("results-url")
                         .html(value.link)
                 )
                 .append($("<br/>"));
      row_item.append(link);
      div.append(row_item);
    });

  }
  return div
}

function createResultsSection(data){
  var div = $("<div></div>")
            .addClass("results");

  $.each( data.results.items, function( key, value ) {
    var row_item = $("<div></div>")
                   .addClass("row");
    var link = $("<div></div>")
               .addClass("col-sm-12 results-details")
               .append($("<a></a>")
                       .attr('href', value.link)
                       .append($("<b></b>")
                               .html(value.htmlTitle)
                       )
               )
               .append($("<br/>"))
               .append($("<span></span>")
                       .addClass("search-results-snippet")
                       .html(value.htmlSnippet)
               )
               .append($("<br/>"))
               .append($("<span></span>")
                       .addClass("results-url")
                       .html(value.link)
               );
    row_item.append(link);
    div.append(row_item);
  });

  return div
}

function createPagination(data){
  var div = "";
  if (data.show_pagination){
    div = $("<div></div>")
          .addClass("listingBar");

    var pagination_ul = $("<ul></ul>")
                        .addClass("pagination");
    div.append(pagination_ul);

    if (data.previous !== undefined){
      var previous = $("<li></li>")
                     .addClass("previous")
                     .append($("<a></a>")
                             .attr('href', '#')
                             .html(" Previous 10 items ")
                             .on('click', function (event){
                               CSEPerformSearch( data.previous, data.refinement );
                               event.preventDefault();
                             })
                     );
      pagination_ul.append(previous);
    }

    if (data.next !== undefined){
      var next = $("<li></li>")
                 .addClass("next")
                 .append($("<a></a>")
                         .attr('href', '#')
                         .html(" Next 10 items ")
                         .on('click', function (event){
                           CSEPerformSearch( data.next, data.refinement );
                           event.preventDefault();
                         })
                 );
      pagination_ul.append(next);
    }

    $.each( data.previous_pages, function( key, value ) {
      var page = $("<li></li>")
                 .append($("<a></a>")
                         .attr('href', '#')
                         .html(value)
                         .on('click', function (event){
                           CSEPerformSearch( value, data.refinement );
                           event.preventDefault();
                         })
                 );
      pagination_ul.append(page);
    });

    var cur_page = $("<li></li>")
           .addClass("active")
           .append($("<a></a>")
                   .attr('href', '#')
                   .html(data.page)
                   .on('click', function (event){
                     event.preventDefault();
                   })
           );
    pagination_ul.append(cur_page);

    var show_last_page = true;
    $.each( data.next_pages, function( key, value ) {
      if (data.last_page !== undefined && value == data.last_page){
        show_last_page = false;
      }
      var page = $("<li></li>")
                 .append($("<a></a>")
                         .attr('href', '#')
                         .html(value)
                         .on('click', function (event){
                           CSEPerformSearch( value, data.refinement );
                           event.preventDefault();
                         })
                 );
      pagination_ul.append(page);
    });

    if (show_last_page && data.last_page !== undefined && data.last_page !== data.page){
      var last_page = $("<li></li>")
                      .append($("<a></a>")
                              .attr('href', '#')
                              .html("...")
                              .on('click', function (event){
                                event.preventDefault();
                              })
                      ).append($("<a></a>")
                              .attr('href', '#')
                              .html(data.last_page)
                              .on('click', function (event){
                                CSEPerformSearch( data.last_page, data.refinement );
                                event.preventDefault();
                              })
                      );
      pagination_ul.append(last_page);
    }

  }
  return div
}

function populateSearchResults(data){
  var search_results = $("div#cse-search-results");
  search_results.html("");

  if (data.query == ""){
    search_results.append($("<div></div>")
                          .addClass("results")
                          .html("Please enter something to search for."));
  }
  else if (data.total == 0){
    search_results.append($("<div></div>")
                          .addClass("results")
                          .html("No results found."));
  }
  else {
    search_results.append(createSearchRefinementsTabs(data));
    search_results.append(createSuggestions(data));
    search_results.append(createSearchBar(data));
    if (data.show_promotions){
        search_results.append(createPromotionsSection(data));
    }
    search_results.append(createResultsSection(data));
    search_results.append(createPagination(data));
  }

}

function CSEPerformSearch( page, refinement ){
  var query = $('div.csesearch input#q').val();
  var sort_by_field = $('div.csesearch select#sort_by');
  sort_by_field.off('change').on('change', function(event){
    CSEPerformSearch( page, refinement );
  })

  var sort_by = sort_by_field.val();
  if (!page) page = 1;
  if (!refinement) refinement = "";

  var extra_args = CSEGetExtraArgs();

  var url = $('div.csesearch form#cse-search-form').data('searchresults-url');
  if (url === undefined){
    var url = "@@csesearchresults";

    if (portal_url !== undefined){
      url = portal_url + "/@@csesearchresults"
    }
  }

  $.ajax({
    url: url,
    data: {
      'q': query,
      'sort_by': sort_by,
      'page': page,
      'refinement': refinement,
      'extra_args': JSON.stringify(extra_args)
    }
  }).done(function( data ) {
    populateSearchResults(data);
  });

}

$(function() {
    console.log( "collective.cse ready!" );
    if ($('div.csesearch input#q').length == 0){
      // Means we are not at the @@csesearch page, so avoid calling the search
      return;
    }
    var query = getParameterByName('q');
    $('div.csesearch input#q').val(query);
    $('div.csesearch form#cse-search-form').on('submit', function(event){
      // XXX: Remove this, if you want to persist the extra_args when changing the query
      CSESetExtraArgs({});
      CSEPerformSearch();
      event.preventDefault();
    })
    CSEPerformSearch();
});

define("/vagrant/src/collective.cse/src/collective/cse/static/js/cse.js", function(){});

