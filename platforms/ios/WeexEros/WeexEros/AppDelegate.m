//
//  AppDelegate.m
//  WeexEros
//
//  Created by XHY on 2017/8/7.
//  Copyright © 2017年 benmu. All rights reserved.
//

#import "AppDelegate.h"
#import <WeexSDK/WeexSDK.h>
#import "Component/CCTextareaTools.h"

@interface AppDelegate ()

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];
    
    //do something
    [WXSDKEngine registerComponent:@"textarea-tools" withClass:[CCTextareaTools class]];
    return result;
}

@end
