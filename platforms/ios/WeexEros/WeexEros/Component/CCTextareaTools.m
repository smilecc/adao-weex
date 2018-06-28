//
//  CCTextareaTools.m
//  WeexEros
//
//  Created by 崔璨 on 2018/6/27.
//  Copyright © 2018年 benmu. All rights reserved.
//

#import "CCTextareaTools.h"

@implementation CCTextareaTools

- (void)viewWillLoad
{
    self.keyboardOpened = false;
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWasShown:)
                                                 name:UIKeyboardWillShowNotification
                                               object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWillHide:)
                                                 name:UIKeyboardWillHideNotification
                                               object:nil];
}

- (void)viewDidLoad
{
    self.view.tag = 30878;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillHideNotification object:nil];
}

- (void)keyboardWasShown:(NSNotification*)notification
{
    NSValue* keyboardObject = [[notification userInfo] objectForKey:UIKeyboardFrameEndUserInfoKey];
    CGRect keyboardRect;
    [keyboardObject getValue:&keyboardRect];
    
    double duration = [[notification.userInfo objectForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
    [UIView beginAnimations:nil context:nil];
    
    [UIView setAnimationDuration:duration];
    [UIView setAnimationDelay:0];
    
    CGRect currentRect = self.view.frame;
    
    if (self.originViewY == 0) {
        self.originViewY = currentRect.origin.y;
    } else {
        currentRect.origin.y = self.originViewY;
    }
    
    currentRect.origin.y -= keyboardRect.size.height;
    
    [self.view setFrame:currentRect];
    [UIView commitAnimations];
}

- (void)keyboardWillHide:(NSNotification*)notification
{
    if (self.originViewY == 0) {
        return;
    }
    
    CGRect currentRect = self.view.frame;
    currentRect.origin.y = self.originViewY;
    [self.view setFrame:currentRect];
    self.originViewY = 0;
}

@end



