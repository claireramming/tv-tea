# TV Tea

TV Tea frontend is deployed on Vercel, backend and db deployed on Koyeb.

[Try it live here!](https://tv-tea.vercel.app/)

TV Tea is an app like Trakt or Serializd that lets users track the TV Shows they are watching. What sets TV Tea apart is the focus on showing the user what episodes are ready to watch across platforms, and most importantly, _what_ platform they can watch the episode on. TV Tea is built with React/Typscript and Django and uses the TMDB API for show info.


This app is in MVP stage, there is a lot more I'd like to add to it! 


### Things the app can currently do:
- Any user, logged in or not, can search for a TV show and view it's show page, which lists info about the show, plus all seasons with a simple episode list.
- users can sign up for an account and log in and out once they have an account
- logged in users can add seasons to their watchlist and view their watchlist
- at the top of the watchlist is the Up Next carousel that shows the user what episodes of the seasons in their watchlist are ready for them to watch, and where they can watch. If they have not started a show but there are episodes available to watch, it will show the season and how many episodes are available to watch. If there is a show in their completed list that has a future season that has begun airing, it will recommend that the user add that season to their watchlist. 
- the watchlist has shows split up by "to watch", "in progress", and "completed", all shows in all tabs display where the user can watch the show. To Watch tab allows users to mark a show as "started". In progress tab allows users to capture how many episodes they have watched od started shows and mark seasons as completed. The completed tab shows the user when they finished watching the show. All tabs allow the user to delete the show from their watchlist. 
- users can view basic info in their user profile


### Things I am working on adding:
- user stats: I'd like to start with showing the user how many episodes they are watching and how many minutes of TV they are watching, aggregated by weekday, week, month, and year.
- pre-watched shows: if a user, especially a new user, has watched several episodes of a show before adding it to their watchlist, I'd like to allow the user to enter that information when they mark the show as "started" so that those episodes they've already been watched don't affect their stats. 
- editable start watch/end watch: I'd like to make the start watching and finish watching dates of seasons editable so the user can update them if they didn't start or finish the season the day they actually marked it in the application
- editable user profile: users can update their username, country, and add preferred providers
- personalized provider display: I'd like to allow users to select which providers they want to prioritize. TMDB prioritizes a certain way but if the user doesn't have the higher priority apps then they won't see their app displayed although it may be an option.
- delay days support: sometimes apps don't have tv shows available right away for the user to watch. I've built in a delay of a day, but I'd like to add the ability for the user to add their own delay amount per show. That way, if the app they are using doesn't show the next episode until a week after it airs, they won't be alerted until it is _actually_ ready for them to watch.
- season display page: I'd like to build out a season specific display page that shows info similar to the show page but just for a single season. This could also allow users to mark specific episodes as watched instead of just assuming the user is watching the episodes in order, which works for most serialized shows but maybe not for series where each episode is it's own bubble episode and users don't need to watch in order. 
- user ratings: I'd like to allow users to rate shows that they've finished watching

### Credits:
This product uses the TMDB API but is not endorsed or certified by TMDB.

