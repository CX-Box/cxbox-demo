/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import NavigationTabsWidget, { NavigationTabsWidgetProps } from '@teslerComponents/widgets/NavigationTabsWidget/NavigationTabsWidget'

export type ViewNavigationWidgetProps = NavigationTabsWidgetProps

function ViewNavigationWidget(props: ViewNavigationWidgetProps) {
    return <NavigationTabsWidget {...props} />
}

export default React.memo(ViewNavigationWidget)
