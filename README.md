# One Window Wonderland

A GNOME Shell extension that automatically maximizes new windows, leaving "useless gaps" around them.

![A screenshot of One Window Wonderland in action](screenshot1.png)

![A screenshot of One Window Wonderland's preferences screen](screenshot2.png)

Get it on [extensions.gnome.org](https://extensions.gnome.org/extension/5696/one-window-wonderland/)!

# Features

- Sizes and positions a new window so that it takes the full workspace, except for the gaps around it.
- Sizes and positions a window that moves to another monitor so that it takes the full workspace, except for the gaps around it.
- The size of the gaps is configurable.
- You can define a list of apps that should be left alone by this extension (the 'ignore list').
- You can define a list of apps that should forcibly be kept in place (the 'force list').

Note that One Window Wonderland leaves windows alone after they've been created or moved to another monitor. You are free to resize them as you see fit, or add them to the force list to keep them in place.

# Other extensions

This extension works well alongside such extensions as [Useless Gaps](https://extensions.gnome.org/extension/4684/useless-gaps/) and [Tiling Assistant](https://extensions.gnome.org/extension/3733/tiling-assistant/): just make sure you configure the gap size correctly in each extension.

It doesn't work with full blown tiling window manager extensions like [Material Shell](https://material-shell.com/).

# Motivation

- Working on a laptop with limited screen real estate, I like my windows to be maximized. This provides focus.
- Having used tiling window managers in the past, I've become fond of "useless gaps". They provide a sense of space.

Tiling window managers (like [AwesomeWM](https://awesomewm.org/) and [QTile](http://www.qtile.org/)) provide this, they have downsides too:

- The rabbit hole of configuring a TWM is _deep_.
- They have more features than I'll ever use, anyway.
- I like the creature comforts of GNOME, where plugging a new keyboard or monitor into my laptop at runtime _just works_.

This extension seeks to fill the niche of what I miss from TWM's in GNOME.

# Building

In order to install this extension locally, run `./build.sh local`.

In order to create a package for upload to extensions.gnome.org, run `./build.sh package`.

# Contributing

I'm open for issues and PRs, but keep in mind that I don't have a lot of time to work on this extension. Therefore, I'll only consider features that I'm likely to use myself; otherwise maintaining them would cost too much time.

# Credits

For this plugin, I took inspiration from:

- tiling window managers
- The [Maximized by default](https://extensions.gnome.org/extension/1193/maximized-by-default/) extension (which still kind of works)
- The [Useless Gaps](https://extensions.gnome.org/extension/4684/useless-gaps/) extension
- [ChatGPT](https://chat.openai.com), which, among other things, came up with the name. What can I say.
