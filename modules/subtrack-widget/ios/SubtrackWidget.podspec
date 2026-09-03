# Without this podspec CocoaPods has nothing to install for the module, so the Swift below it is
# never compiled into the app, `requireOptionalNativeModule('SubtrackWidget')` returns null, and
# the widget silently receives no data. Every Expo module ships one; a local module is no
# exception. Autolinking discovers it via ../expo-module.config.json.

Pod::Spec.new do |s|
  s.name           = 'SubtrackWidget'
  s.version        = '1.0.0'
  s.summary        = 'Writes SubTrack figures into the shared App Group and reloads WidgetKit.'
  s.description    = s.summary
  s.license        = 'MIT'
  s.author         = 'SubTrack'
  s.homepage       = 'https://github.com/Endo-bit/Subtrack'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/Endo-bit/Subtrack.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
