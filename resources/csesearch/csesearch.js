import $ from "jquery";
import Base from "@patternslib/patternslib/src/core/base";

export default Base.extend({
    name: "csesearch",
    trigger: ".pat-csesearch",
    parser: "mockup",

    defaults: {},
    extra_args: {},

    CSESetExtraArgs (args){
        var self = this;
        self.extra_args = args;
    },

    CSEGetExtraArgs () {
        var self = this;
        return self.extra_args;
    },

    getParameterByName (name) {
        // Helper to get value from parameter
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    createSearchRefinementsTabs (data){
        var self = this;
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
              self.CSEPerformSearch( data.page, value.value );
              event.preventDefault();
            })
          );
          nav_refinements.append(nav_item);
        });

        return div
    },

    createSuggestions (data){
      var self = this;
      var $el = $(self.$el);
      var div = "";
      if (data.results.spelling !== undefined){
        div = $("<div></div>")
              .attr('id', "api-url")
              .append($("<span></span>").text("You searched for " + data.query + ". Did you mean "))
              .append($("<a></a>")
                      .attr('href', '#')
                      .html(data.results.spelling.htmlCorrectedQuery)
                      .on('click', function (event){
                        $('input#q', $el).val(data.results.spelling.correctedQuery);
                        self.CSEPerformSearch( data.page );
                        event.preventDefault();
                      }))
      }
      return div
    },

    createSearchBar (data){
      var div = $("<div></div>")
                .attr('id', 'searchbar')
                .addClass('row');
      var inner_div = $("<div></div>")
                      .addClass('col-md-12');
      div.append(inner_div);
      inner_div.append($("<b></b>").text("Search Results"));
      inner_div.append($("<span></span>").text(" Results ")
                       .append($("<b></b>").text(data.start))
                       .append($("<span></span>").text(" - "))
                       .append($("<b></b>").text(data.end))
                       .append($("<span></span>").text(" for "))
                       .append($("<b></b>").text(data.query)));
      inner_div.append($("<hr/>"));
      return div
    },

    createPromotionsSection (data){
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
    },

    createResultsSection (data){
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
                                   .text(value.htmlTitle)
                           )
                   )
                   .append($("<br/>"))
                   .append($("<span></span>")
                           .addClass("search-results-snippet")
                           .text(value.htmlSnippet)
                   )
                   .append($("<br/>"))
                   .append($("<span></span>")
                           .addClass("results-url")
                           .text(value.link)
                   );
        row_item.append(link);
        div.append(row_item);
      });

      return div
    },

    createPagination (data){
      var self = this;
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
                                 .text(" Previous 10 items ")
                                 .on('click', function (event){
                                   self.CSEPerformSearch( data.previous, data.refinement );
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
                             .text(" Next 10 items ")
                             .on('click', function (event){
                               self.CSEPerformSearch( data.next, data.refinement );
                               event.preventDefault();
                             })
                     );
          pagination_ul.append(next);
        }

        $.each( data.previous_pages, function( key, value ) {
          var page = $("<li></li>")
                     .append($("<a></a>")
                             .attr('href', '#')
                             .text(value)
                             .on('click', function (event){
                               self.CSEPerformSearch( value, data.refinement );
                               event.preventDefault();
                             })
                     );
          pagination_ul.append(page);
        });

        var cur_page = $("<li></li>")
               .addClass("active")
               .append($("<a></a>")
                       .attr('href', '#')
                       .text(data.page)
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
                             .text(value)
                             .on('click', function (event){
                               self.CSEPerformSearch( value, data.refinement );
                               event.preventDefault();
                             })
                     );
          pagination_ul.append(page);
        });

        if (show_last_page && data.last_page !== undefined && data.last_page !== data.page){
          var last_page = $("<li></li>")
                          .append($("<a></a>")
                                  .attr('href', '#')
                                  .text("...")
                                  .on('click', function (event){
                                    event.preventDefault();
                                  })
                          ).append($("<a></a>")
                                  .attr('href', '#')
                                  .text(data.last_page)
                                  .on('click', function (event){
                                    self.CSEPerformSearch( data.last_page, data.refinement );
                                    event.preventDefault();
                                  })
                          );
          pagination_ul.append(last_page);
        }

      }
      return div
    },

    populateSearchResults(data){
      var self = this;
      var $el = $(self.$el);
      var search_results = $("div#cse-search-results", $el);
      search_results.html("");

      if (data.query == ""){
        search_results.append($("<div></div>")
                              .addClass("results")
                              .text("Please enter something to search for."));
      }
      else if (data.total == 0){
        search_results.append($("<div></div>")
                              .addClass("results")
                              .text("No results found."));
      }
      else {
        search_results.append(self.createSearchRefinementsTabs(data));
        search_results.append(self.createSuggestions(data));
        search_results.append(self.createSearchBar(data));
        if (data.show_promotions){
            search_results.append(self.createPromotionsSection(data));
        }
        search_results.append(self.createResultsSection(data));
        search_results.append(self.createPagination(data));
      }

    },

    async CSEPerformSearch( page, refinement ){
      var self = this;
      var $el = $(self.$el);
      var query = $('input#q', $el).val();
      var sort_by_field = $('select#sort_by', $el);
      sort_by_field.off('change').on('change', async function(event){
        await self.CSEPerformSearch( page, refinement );
      })

      var sort_by = sort_by_field.val();
      if (!page) page = 1;
      if (!refinement) refinement = "";

      var extra_args = self.CSEGetExtraArgs();

      var url = $('form#cse-search-form', $el).data('searchresults-url');
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
          'page': parseInt(page),
          'refinement': refinement,
          'extra_args': JSON.stringify(extra_args)
        }
      }).done( function( data ) {
        self.populateSearchResults(data);
      });

    },

    async init() {
        import("./csesearch.scss");
        var self = this;
        var $el = $(this.el);
        var query = self.getParameterByName('q');
        $('input#q', $el).val(query);
        $('form#cse-search-form', $el).on('submit', async function(event){
          // XXX: Remove this, if you want to persist the extra_args when changing the query
          self.CSESetExtraArgs({});
          await self.CSEPerformSearch();
          event.preventDefault();
        })
        await self.CSEPerformSearch();
        console.log( "collective.cse ready!" );
    },
});